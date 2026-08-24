// src/pages/ViewPage2.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Hls from 'hls.js';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


import { defaultConfig } from '../../App/configs/common';

const API_BASE = 'https://dev3.eoe.lk/api';
const toRelative = (u?: string) => (u ? u.replace(/^http?:\/\/dev3\.eoe\.lk/i, '') : u);

// --- cache-buster helper ---
const addBuster = (u: any) => `${u}${u.includes('?') ? '&' : '?'}t=${Date.now()}`;

export default function ViewPageTuteDiscussions2() {
  const { videoId, id } = useParams<{ videoId: string; id: string; class_id: string }>();

  // ---- HLS/meta ----
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [hlsUrl, setHlsUrl] = useState<any | null>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [buffering, setBuffering] = useState(false);

  // ---- UI state ----
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // ---- remember media state to avoid jumps/volume resets ----
  const lastTimeRef = useRef(0);
  const lastVolumeRef = useRef(1);
  const lastMutedRef = useRef(false);
  const wantPlayRef = useRef(false);
  const firstLoadedMetaRef = useRef(true);
  const recoveringRef = useRef(false);

  // ---- audio/watermark ----
  const [, setAudioIssue] = useState<string | null>(null);
  const [, setHasAudioTracks] = useState<boolean | null>(null);

  // ---- remaining / tick (minute-based) ----
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const [, setQuotaError] = useState<string | null>(null);

  const tickLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsSinceLastTickRef = useRef<number>(0); // counts real play seconds
  const isActivePlayRef = useRef<boolean>(false);
  const lastWallClockRef = useRef<number | null>(null);
  const pendingToSendRef = useRef<number>(0); // leftover <60 sec
  const tickInFlightRef = useRef<boolean>(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeOverReportedRef = useRef(false);

  // ------------ helpers ------------
  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Show h/m but effectively changes only when remainingSecs is updated by server (tick/remaining API)
  const formatRemaining = (secs: number | null) => {
    if (secs === null || secs < 0) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60); // minute-step visual
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const detectAudio = (video: HTMLVideoElement) => {
    try {
      const audioTracks = (video as any).audioTracks;
      const webkitAudioDecodedByteCount = (video as any).webkitAudioDecodedByteCount;
      const hasDecoded = webkitAudioDecodedByteCount > 0;
      const isActuallyPlayingAudio = video.volume > 0 && !video.muted;
      const hasAudio = (audioTracks && audioTracks.length > 0) || hasDecoded || isActuallyPlayingAudio;
      setHasAudioTracks(hasAudio);
      setAudioIssue(hasAudio ? null : 'No audio track detected in the video');
    } catch {}
  };

  // ------------ Fetch HLS meta (new endpoint) ------------
  useEffect(() => {
    if (!videoId) return;
    let mounted = true;
    setLoading(true);
    setErr('');
    setMeta(null);

    axios
      .get(`${API_BASE}/videos/${videoId}`)
      .then((res) => {
        if (!mounted) return;
        const d = res.data || {};
        const master = toRelative(d.master_url);
        setMeta({ ...d, master_url: master, thumbnail: toRelative(d.thumbnail) });
        setHlsUrl(addBuster(master)); // ✅ force fresh playlist on first load
      })
      .catch((e) => setErr(e?.response?.data?.message || e.message || 'Failed to load video'))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [videoId]);

  // ------------ Init HLS (preserve media state across recovery) ------------
  useEffect(() => {
    const el = videoRef.current;
    if (!hlsUrl || !el) return;

    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        backBufferLength: 60,
        manifestLoadingTimeOut: 20000,
        fragLoadingTimeOut: 20000,
        xhrSetup: (xhr: { withCredentials: boolean }) => {
          xhr.withCredentials = true;
        },
        // ✅ Force every fetch (manifests + segments) to bypass cache
        fetchSetup: (_ctx: any, init: RequestInit | undefined) => ({
          ...(init || {}),
          credentials: 'include',
          cache: 'no-store',
          headers: {
            ...(init?.headers || {}),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        }),
      } as any);

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels || []);
        // Restore media state if recovering or user hit play before ready
        if (recoveringRef.current || wantPlayRef.current) {
          el.currentTime = lastTimeRef.current || el.currentTime;
          el.muted = lastMutedRef.current;
          el.volume = lastVolumeRef.current;
          if (
            wantPlayRef.current &&
            el.paused &&
            !(typeof remainingSecs === 'number' && remainingSecs <= 0)
          ) {
            el.play().catch(() => {});
          }
          recoveringRef.current = false;
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        lastTimeRef.current = el.currentTime;
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        lastTimeRef.current = el.currentTime;
        lastVolumeRef.current = el.volume;
        lastMutedRef.current = el.muted;

        if (data?.type === Hls.ErrorTypes.NETWORK_ERROR) setBuffering(true);

        if (data?.fatal) {
          recoveringRef.current = true;
          try {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Try restart loading
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                // Unrecoverable: stop buffering and show error
                setBuffering(false);
                setErr(
                  'Video playback failed due to a network or media error. Please check your connection and try again.'
                );
                hls.destroy();
                hlsRef.current = null;
            }
          } catch {}
        }
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => setBuffering(false));
      hls.on(Hls.Events.BUFFER_EOS, () => setBuffering(false));

      hls.attachMedia(el);
      hls.loadSource(hlsUrl);
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      // ✅ Safari native: also bust
      el.src = addBuster(hlsUrl);
      el.load();
    } else {
      setErr('HLS not supported in this browser.');
    }

    return () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, [hlsUrl]); // ✅ only depends on hlsUrl

  // ------------ Manual quality ------------
  useEffect(() => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = currentLevel; // -1 Auto
  }, [currentLevel]);

  // ------------ Bootstrap remaining (server authoritative) ------------
  useEffect(() => {
    const vId = Number(id);
    if (!vId) return;
    (async () => {
      try {
        const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${vId}/remaining_tute`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });
        const data = await res.json();
        if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('authToken');
          window.location.href = '/';
          return;
        }
        if (!res.ok) throw new Error(data?.error || 'remaining failed');
        const rem = typeof data?.remaining_seconds === 'number' ? data.remaining_seconds : null;
        setRemainingSecs(rem);
      } catch {
        // keep null; UI shows —
      }
      ensureMinuteTickLoop(); // start loop independent of API latency
    })();
  }, [id]);

  const fetchRemainingOnce = async () => {
    try {
      const vId = Number(id);
      if (!vId) return;
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${vId}/remaining_tute`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      const data = await res.json();
      if (res.status === 200 && typeof data?.remaining_seconds === 'number') {
        setRemainingSecs(data.remaining_seconds);
      }
    } catch {}
  };

  // ------------ tick: send ONLY whole-minute chunks, update remaining on response ------------
  async function postTickOnce(videoNumericId: number, secondsPlayed: number): Promise<boolean> {
    if (secondsPlayed < 60 || tickInFlightRef.current) return true; // send in 60s+ chunks only
    tickInFlightRef.current = true;
    try {
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${videoNumericId}/tick_tute`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        // enforce 60-second steps; server cap 70 is fine, but we stick to 60
        body: JSON.stringify({ played_seconds: Math.min(Math.floor(secondsPlayed / 60) * 60, 70) }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {}
      if (!res.ok) {
        if (res.status === 403) {
          videoRef.current?.pause();
          setQuotaError('Your viewing time for this video has ended.');
          setRemainingSecs(0);
          return false;
        } else if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('authToken');
          window.location.href = '/';
        }
        return false;
      }
      if (typeof data?.remaining_seconds === 'number') {
        setRemainingSecs(data.remaining_seconds); // UI updates minute-by-minute
        if (data.remaining_seconds <= 0) {
          videoRef.current?.pause();
        }
      }
      return true;
    } catch {
      return false;
    } finally {
      tickInFlightRef.current = false;
    }
  }

  // Break large totals into 60s chunks (e.g., 121s -> send 60 + 60; keep 1s pending)
  async function flushWholeMinutes(videoNumericId: number, totalSeconds: number) {
    let toSend = Math.floor(totalSeconds / 60) * 60; // multiple of 60
    while (toSend >= 60) {
      const chunk = Math.min(toSend, 60); // send in 60s steps
      const ok = await postTickOnce(videoNumericId, chunk);
      if (!ok) return false;
      toSend -= chunk;
    }
    return true;
  }

  // ------------ 1Hz loop: count real playtime; tick every full minute ------------
  function ensureMinuteTickLoop() {
    if (tickLoopRef.current) return;

    lastWallClockRef.current = Date.now();
    isActivePlayRef.current =
      !!videoRef.current &&
      !videoRef.current.paused &&
      !(typeof remainingSecs === 'number' && remainingSecs <= 0);

    tickLoopRef.current = setInterval(async () => {
      // If time is up, stop playing; no more accumulation
      if (typeof remainingSecs === 'number' && remainingSecs <= 0) {
        videoRef.current?.pause();
        isActivePlayRef.current = false;
        return;
      }

      const now = Date.now();
      const dt = lastWallClockRef.current ? Math.max(0, (now - lastWallClockRef.current) / 1000) : 1;
      lastWallClockRef.current = now;

      if (isActivePlayRef.current) {
        secondsSinceLastTickRef.current += dt;

        // When accumulated >= 60s, send tick(s) in 60s chunks
        if (secondsSinceLastTickRef.current >= 60) {
          const vId = Number(id);
          if (vId) {
            const total = secondsSinceLastTickRef.current + pendingToSendRef.current;
            const whole = Math.floor(total / 60) * 60;
            const ok = await flushWholeMinutes(vId, whole);
            if (ok) {
              const leftover = total - whole;
              pendingToSendRef.current = leftover;
              secondsSinceLastTickRef.current = 0;
            } else {
              // keep accumulators; we'll retry on next loop
            }
          }
        }
      }
    }, 1000);

    // pause/resume handling on tab visibility
    const onVis = async () => {
      const vId = Number(id);
      if (document.hidden) {
        isActivePlayRef.current = false;
        // flush ONLY whole minutes when backgrounding
        if (vId) {
          const total = secondsSinceLastTickRef.current + pendingToSendRef.current;
          const whole = Math.floor(total / 60) * 60;
          if (whole >= 60) await flushWholeMinutes(vId, whole);
          const leftover = total - whole;
          secondsSinceLastTickRef.current = 0;
          pendingToSendRef.current = leftover; // keep <60s remainder
        }
      } else {
        lastWallClockRef.current = Date.now();
        if (
          videoRef.current &&
          !videoRef.current.paused &&
          !(typeof remainingSecs === 'number' && remainingSecs <= 0)
        ) {
          isActivePlayRef.current = true;
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // cleanup registrar
    return () => {
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  // ------------ time-over report ------------
  useEffect(() => {
    if (typeof remainingSecs === 'number' && remainingSecs <= 0) {
      reportTimeOver();
    }
  }, [remainingSecs]);

  const reportTimeOver = useCallback(async () => {
    if (timeOverReportedRef.current) return;
    timeOverReportedRef.current = true;
    try {
      await fetch(`${defaultConfig.BASE_API_URL}/videos/${id}/time-over_tute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
    } catch {}
  }, [id]);

  // ------------ Keyboard shortcuts ------------
  useEffect(() => {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const stepSpeed = (cur: number, dir: 1 | -1) =>
      speeds[Math.min(speeds.length - 1, Math.max(0, speeds.indexOf(cur) + dir))] ?? 1;

    const changeSpeed = (s: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = s;
      setPlaybackSpeed(s);
      setShowSpeedIndicator(true);
      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
      speedTimeoutRef.current = setTimeout(() => setShowSpeedIndicator(false), 900);
    };

    const toggleFS = () => {
      const el = wrapperRef.current;
      if (!el) return;
      if (!document.fullscreenElement) {
        (el.requestFullscreen?.() ||
          (el as any).webkitRequestFullscreen?.() ||
          (el as any).mozRequestFullScreen?.() ||
          (el as any).msRequestFullscreen?.())?.catch?.(() => {});
        setIsFullscreen(true);
      } else {
        (document.exitFullscreen?.() ||
          (document as any).webkitExitFullscreen?.() ||
          (document as any).mozCancelFullScreen?.() ||
          (document as any).msExitFullscreen?.())?.catch?.(() => {});
        setIsFullscreen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;

      // block dev shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 's' ||
          e.key === 'S' ||
          e.key === 'u' ||
          e.key === 'U' ||
          (e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
          e.key === 'F12')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (typeof remainingSecs === 'number' && remainingSecs <= 0) return;
          if (v.paused) v.play().catch(() => {});
          else v.pause();
          break;
        case 'ArrowRight':
          v.currentTime = Math.min(v.duration || v.currentTime + 10, v.currentTime + 10);
          break;
        case 'ArrowLeft':
          v.currentTime = Math.max(0, v.currentTime - 10);
          break;
        case 'ArrowUp':
          v.volume = Math.min(1, (v.volume || 0) + 0.05);
          lastVolumeRef.current = v.volume;
          break;
        case 'ArrowDown':
          v.volume = Math.max(0, (v.volume || 0) - 0.05);
          lastVolumeRef.current = v.volume;
          break;
        case 'm':
        case 'M':
          v.muted = !v.muted;
          lastMutedRef.current = v.muted;
          break;
        case 'f':
        case 'F':
          toggleFS();
          break;
        case '>':
        case '.':
          changeSpeed(stepSpeed(playbackSpeed, +1));
          break;
        case '<':
        case ',':
          changeSpeed(stepSpeed(playbackSpeed, -1));
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playbackSpeed, remainingSecs]);

  // ------------ buffering watchdog (auto-recover) ------------
  useEffect(() => {
    if (buffering) {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

      retryTimerRef.current = setTimeout(() => {
        // still buffering after 15s -> soft reload HLS
        if (buffering) {
          recoveringRef.current = true;
          setHlsUrl((u: string) => addBuster(u.replace(/(\?|&)t=\d+/, '')));
        }
      }, 15000);
    } else {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    }

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [buffering]);

  // ------------ UI handlers ------------
  const handlePlayPause = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (typeof remainingSecs === 'number' && remainingSecs <= 0) return;

    if (v.paused) {
      if (remainingSecs == null) await fetchRemainingOnce(); // first play fetch
      wantPlayRef.current = true;
      v.play().catch(() => {});
      setIsPlaying(true);
      isActivePlayRef.current = true;
      lastWallClockRef.current = Date.now();
      ensureMinuteTickLoop();
    } else {
      // On pause, flush whole-minute chunks only
      const vId = Number(id);
      if (vId) {
        const total = secondsSinceLastTickRef.current + pendingToSendRef.current;
        const whole = Math.floor(total / 60) * 60;
        if (whole >= 60) await flushWholeMinutes(vId, whole);
        const leftover = total - whole;
        secondsSinceLastTickRef.current = 0;
        pendingToSendRef.current = leftover;
      }
      wantPlayRef.current = false;
      v.pause();
      setIsPlaying(false);
      isActivePlayRef.current = false;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      lastVolumeRef.current = val;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
    lastTimeRef.current = t;
  };

  const toggleFullscreenBtn = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      (el.requestFullscreen?.() ||
        (el as any).webkitRequestFullscreen?.() ||
        (el as any).mozRequestFullScreen?.() ||
        (el as any).msRequestFullscreen?.())?.catch?.(() => {});
      setIsFullscreen(true);
    } else {
      (document.exitFullscreen?.() ||
        (document as any).webkitExitFullscreen?.() ||
        (document as any).mozCancelFullScreen?.() ||
        (document as any).msExitFullscreen?.())?.catch?.(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now(),
      DOUBLE = 300,
      SKIP = 10;
    const tapX = 'clientX' in e ? e.clientX : (e as React.TouchEvent).touches[0].clientX;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const left = tapX < rect.left + rect.width / 2;
    if (now - lastTapTimeRef.current < DOUBLE) {
      if (!videoRef.current) return;
      const t = Math.max(
        0,
        Math.min(videoRef.current.duration, videoRef.current.currentTime + (left ? -SKIP : SKIP))
      );
      videoRef.current.currentTime = t;
      lastTimeRef.current = t;
    }
    lastTapTimeRef.current = now;
  };

  // ------------ watermark + media listeners ------------
  useEffect(() => {
    const v = videoRef.current;
    if (!hlsUrl || !v) return;

    let wm: HTMLDivElement | null = null;
    let posInterval: NodeJS.Timeout | null = null;

    const onLoadedMeta = () => {
      if (firstLoadedMetaRef.current) {
        v.muted = lastMutedRef.current;
        v.volume = lastVolumeRef.current;
        v.playbackRate = playbackSpeed;
        firstLoadedMetaRef.current = false;
      }
      detectAudio(v);
      setDuration(v.duration);
      if (wantPlayRef.current && v.paused && !(typeof remainingSecs === 'number' && remainingSecs <= 0)) {
        v.play().catch(() => {});
      }
    };

    const onTime = () => {
      setCurrentTime(v.currentTime);
      setProgress((v.currentTime / (v.duration || 1)) * 100);
      lastTimeRef.current = v.currentTime;
    };

    const onPlay = () => {
      if (typeof remainingSecs === 'number' && remainingSecs <= 0) {
        v.pause();
        return;
      }
      setIsPlaying(true);
      isActivePlayRef.current = true;
      lastWallClockRef.current = Date.now();
    };

    const onPause = () => {
      setIsPlaying(false);
      isActivePlayRef.current = false;
    };

    const onVol = () => {
      setVolume(v.muted ? 0 : v.volume);
      lastVolumeRef.current = v.volume;
      lastMutedRef.current = v.muted;
    };

    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onStalled = () => setBuffering(true);
    const onSeeked = () => setBuffering(false);

    // Watermark
    const addWM = () => {
      if (!wrapperRef.current) return;
      wrapperRef.current.querySelectorAll('.watermark').forEach((n) => n.remove());
      const watermark = document.createElement('div');
      watermark.className = 'watermark';
      watermark.style.cssText = `
        position:absolute;color:rgba(255,255,255,.7);padding:5px;font-size:8px;pointer-events:none;user-select:none;
        text-shadow:1px 1px 2px rgba(0,0,0,.7);z-index:2147483647;font-family:Arial,sans-serif;white-space:nowrap;`;
      const userId = localStorage.getItem('evrest_id');
      const timestamp = new Date().toISOString();
      const randomId = Math.random().toString(36).slice(2, 10);
      watermark.textContent = `User: ${userId} • ID: ${randomId} • ${timestamp.substring(0, 10)}`;
      wrapperRef.current.appendChild(watermark);
      wm = watermark;

      const updatePos = () => {
        if (!wrapperRef.current || !wm) return;
        const wr = wrapperRef.current.getBoundingClientRect();
        const vw = v.videoWidth || wr.width,
          vh = v.videoHeight || wr.height;
        const arV = vw / vh,
          arC = wr.width / wr.height;
        let w = 0,
          h = 0,
          offX = 0,
          offY = 0;
        if (arV > arC) {
          w = wr.width;
          h = wr.width / arV;
          offX = 0;
          offY = (wr.height - h) / 2;
        } else {
          w = wr.height * arV;
          h = wr.height;
          offX = (wr.width - w) / 2;
          offY = 0;
        }
        const wmW = 200,
          wmH = 30;
        const maxX = Math.max(0, w - wmW),
          maxY = Math.max(0, h - wmH);
        const rx = Math.floor(Math.random() * maxX),
          ry = Math.floor(Math.random() * maxY);
        wm.style.left = `${offX + rx}px`;
        wm.style.top = `${offY + ry}px`;
        wm.style.opacity = (Math.random() * 0.3 + 0.7).toFixed(2);
      };
      const onFS = () => {
        if (wm) {
          wm.remove();
          wm = null;
        }
        setTimeout(addWM, 200);
      };
      const onResize = () => setTimeout(updatePos, 100);
      setTimeout(updatePos, 100);
      posInterval = setInterval(updatePos, 8000 + Math.random() * 4000);

      window.addEventListener('resize', onResize);
      document.addEventListener('fullscreenchange', onFS);
      document.addEventListener('webkitfullscreenchange', onFS as any);
      document.addEventListener('mozfullscreenchange', onFS as any);
      document.addEventListener('MSFullscreenChange', onFS as any);

      return () => {
        if (posInterval) clearInterval(posInterval);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('fullscreenchange', onFS);
        document.removeEventListener('webkitfullscreenchange', onFS as any);
        document.removeEventListener('mozfullscreenchange', onFS as any);
        document.removeEventListener('MSFullscreenChange', onFS as any);
      };
    };

    const cleanupWM = addWM();

    v.addEventListener('loadedmetadata', onLoadedMeta);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('volumechange', onVol);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('stalled', onStalled);
    v.addEventListener('seeked', onSeeked);

    const onCtx = (e: MouseEvent) => {
      if (e.target === v) e.preventDefault();
    };
    document.addEventListener('contextmenu', onCtx);

    return () => {
      cleanupWM && cleanupWM();
      v.removeEventListener('loadedmetadata', onLoadedMeta);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('volumechange', onVol);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('stalled', onStalled);
      v.removeEventListener('seeked', onSeeked);
      document.removeEventListener('contextmenu', onCtx);

      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
      if (tickLoopRef.current) {
        clearInterval(tickLoopRef.current);
        tickLoopRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, playbackSpeed]); // ✅ removed remainingSecs here

  // ------------ UI ------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = `/tutediscussions`)}
            className="inline-flex items-center px-4 py-2 bg-white text-purple-700 rounded-lg shadow-sm hover:bg-purple-50 transition-all duration-300 border border-purple-100 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Class
          </button>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 backdrop-blur-sm bg-opacity-90 animate-fade-in">
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="ml-4 text-3xl font-bold bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  {meta?.title || 'Secure Video Player'}
                </h2>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-purple-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-t-8 border-purple-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-6 text-lg text-purple-700 font-medium">Preparing your video...</p>
                </div>
              )}

              {err && (
                <div className="mt-6 p-6 bg-red-50 rounded-xl border border-red-100 text-center">
                  <p className="text-red-600 font-medium text-lg">{err}</p>
                </div>
              )}

              {/* Time up screen */}
              {typeof remainingSecs === 'number' && remainingSecs <= 0 && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70">
                  <div className="px-5 py-4 rounded-xl bg-white text-gray-900 shadow-lg">
                    <div className="text-lg font-semibold">Time’s up</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Your viewing time for this video has ended.
                    </div>
                  </div>
                </div>
              )}

              {hlsUrl && !loading && !err && (
                <div className="mt-4 w-full flex flex-col items-center relative">
                  {/* buffering overlay */}
                  {buffering && !(typeof remainingSecs === 'number' && remainingSecs <= 0) && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-black/60 px-4 py-2 rounded-md text-white text-sm">
                        Buffering…
                      </div>
                    </div>
                  )}

                  <div
                    ref={wrapperRef}
                    className="relative w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
                    onMouseMove={() => {
                      setShowControls(true);
                      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
                    }}
                    onTouchStart={handleDoubleTap}
                  >
                    {/* Remaining badge */}
                    {typeof remainingSecs === 'number' && (
                      <div className="absolute right-3 top-3 z-20">
                        <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-xs font-semibold border border-white/10">
                          Remaining: {formatRemaining(remainingSecs)}
                        </div>
                      </div>
                    )}

                    {/* Video */}
                    <video
                      ref={videoRef}
                      crossOrigin="anonymous"
                      className="w-full rounded-xl"
                      controlsList="nodownload"
                      disablePictureInPicture
                      playsInline
                      preload="auto"
                      muted={false}
                      poster={meta?.thumbnail || undefined}
                      onClick={handlePlayPause}
                      onLoadedMetadata={() => {
                        const v = videoRef.current;
                        if (!v) return;
                        detectAudio(v);
                        setDuration(v.duration);
                      }}
                    />

                    {/* Custom Controls */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                        showControls ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {/* Progress */}
                      <div className="flex items-center mb-2">
                        <span className="text-white text-xs mr-2">
                          {formatTime(currentTime)}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleProgressChange}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                        />
                        <span className="text-white text-xs ml-2">
                          {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Play/Pause */}
                          <button
                            onClick={handlePlayPause}
                            disabled={
                              typeof remainingSecs === 'number' && remainingSecs <= 0
                            }
                            className={`text-white transition-colors ${
                              typeof remainingSecs === 'number' && remainingSecs <= 0
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:text-purple-300'
                            }`}
                          >
                            {isPlaying ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                              </svg>
                            )}
                          </button>

                          {/* Volume */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Quality */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-white/80">Quality</label>
                            <select
                              value={currentLevel}
                              onChange={(e) => setCurrentLevel(parseInt(e.target.value, 10))}
                              className="text-sm border rounded-md px-2 py-1 bg-white"
                              disabled={!levels.length}
                            >
                              <option value={-1}>Auto</option>
                              {levels.map((lvl, idx) => {
                                const label = lvl.height
                                  ? `${lvl.height}p`
                                  : `${lvl.width}x${lvl.height}`;
                                return (
                                  <option key={idx} value={idx}>
                                    {label}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Speed */}
                          <div className="relative group">
                            <button className="text-white hover:text-purple-300 transition-colors flex items-center">
                              <span className="text-sm mr-1">{playbackSpeed}x</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    const v = videoRef.current;
                                    if (!v) return;
                                    v.playbackRate = s;
                                    setPlaybackSpeed(s);
                                    setShowSpeedIndicator(true);
                                    if (speedTimeoutRef.current)
                                      clearTimeout(speedTimeoutRef.current);
                                    speedTimeoutRef.current = setTimeout(
                                      () => setShowSpeedIndicator(false),
                                      1000
                                    );
                                  }}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    playbackSpeed === s
                                      ? 'text-purple-400'
                                      : 'text-white hover:bg-gray-700'
                                  }`}
                                >
                                  {s}x
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Fullscreen */}
                          <button
                            onClick={toggleFullscreenBtn}
                            className="text-white hover:text-purple-300 transition-colors"
                          >
                            {isFullscreen ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showSpeedIndicator && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-bold">
                      {playbackSpeed}x
                    </div>
                  )}
                </div>
              )}

              {meta?.status && meta?.status !== 'ready' && (
                <div className="mt-4 text-sm text-gray-600">
                  Your video is still processing. The player will work when status becomes{' '}
                  <span className="font-medium">ready</span>.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
