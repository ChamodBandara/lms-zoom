import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useSearchParams } from 'react-router-dom';
import { defaultConfig } from '../../App/configs/common';

// Screen Orientation types
declare global {
  interface ScreenOrientation {
    lock: (orientation: OrientationType) => Promise<void>;
    unlock: () => void;
  }
}

interface VideoData {
  id: number;
  title: string;
  token: string;
  videoId: number;
  formats?: { webm?: string; mp4?: string };
}

export default function ViewPageMobile1() {
  const { videoId, everestId, id, token } = useParams<{ videoId: string; everestId: string; id: string; token: string }>();
  const [searchParams] = useSearchParams();

  // Prefer query ?access_token=, then route param :token, then localStorage fallback
  const accessToken =
    searchParams.get('access_token') ||
    token ||
    (typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '');

  // Data
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentFormat, setCurrentFormat] = useState<'webm' | 'mp4'>('webm');

  // Fetch/load status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState<string>('ready');

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioIssue, setAudioIssue] = useState<string | null>(null);
  const [, setHasAudioTracks] = useState<boolean | null>(null);

  // UI controls
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState<boolean>(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Session/auth
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const fingerprintParam = searchParams.get('fingerprint');

  // === TIMER (quota) ===
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const remainingRef = useRef<number | null>(null);
  const overRef = useRef<boolean>(false);
  const bootstrappedRef = useRef<boolean>(false);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActivePlayRef = useRef<boolean>(false);

  // Wall-clock + tick queue
  const lastWallClockRef = useRef<number | null>(null);
  const playedSincePostRef = useRef<number>(0);
  const queuedToSendRef = useRef<number>(0);
  const tickInFlightRef = useRef<boolean>(false);
  const backoffRef = useRef<number>(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth overlay
  const [authError, setAuthError] = useState(false);

  // Once-only time over report
  const timeOverReportedRef = useRef(false);

  // Utils
  const isMobileDevice = useCallback(
    () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    []
  );

  const generateFingerprint = (): string => {
    if (fingerprintParam) return fingerprintParam;
    const parts = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      // @ts-ignore
      screen.colorDepth,
      // @ts-ignore
      `${screen.width}x${screen.height}`,
      // @ts-ignore
      navigator.hardwareConcurrency,
      !!window.sessionStorage,
      !!window.localStorage,
      !!window.indexedDB,
    ];
    return btoa(parts.join('|||')).replace(/=/g, '').substring(0, 32);
  };

  const lockToLandscape = useCallback(async () => {
    if (typeof screen !== 'undefined' && screen.orientation?.lock) {
      try { await screen.orientation.lock('landscape' as any); } catch {}
    }
  }, []);
  const unlockOrientation = useCallback(() => {
    if (typeof screen !== 'undefined' && screen.orientation?.unlock) {
      try { screen.orientation.unlock(); } catch {}
    }
  }, []);

  const scheduleAutoHide = useCallback((delay = 2500) => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), delay);
  }, []);
  const wakeControls = useCallback(() => {
    setShowControls(true);
    if (isPlaying) scheduleAutoHide();
  }, [isPlaying, scheduleAutoHide]);

  // ---- metadata + secure URL ----
  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided');
      setLoading(false);
      return;
    }
    const fetchMeta = async () => {
      setLoading(true); setError(null);
      try {
        const fingerprint = generateFingerprint();
        const res = await fetch(`${defaultConfig.BASE_API_URL2}/videos`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Security-Fingerprint': fingerprint,
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Authentication required. Please login.');
          if (res.status === 403) throw new Error('Access forbidden. Security validation failed.');
          throw new Error('No video found');
        }
        const data = await res.json();
        if (!data.videos?.length) throw new Error('No videos available');
        const v = data.videos.find((x: VideoData) => x.id === parseInt(videoId));
        if (!v) throw new Error(`Video with ID ${videoId} not found`);
        setVideoData(v);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No video found. Please upload one first.');
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, [videoId, accessToken]);

  const checkCompressionStatus = async (vid: number) => {
    try {
      const response = await fetch(`${defaultConfig.BASE_API_URL2}/video/${vid}/compression-status`);
      if (!response.ok) return;
      const data = await response.json();
      setCompressionStatus(data.status);
      if (data.status === 'processing') setTimeout(() => checkCompressionStatus(vid), 3000);
    } catch {}
  };

  const checkFallbackFormat = async (fallbackUrl: string) => {
    try {
      const response = await fetch(fallbackUrl, { method: 'HEAD' });
      if (response.ok) {
        setVideoUrl(fallbackUrl);
        setCurrentFormat('mp4');
        setAudioIssue(null);
        setIsVideoLoading(true);
      } else {
        setAudioIssue('No audio track available in any format');
      }
    } catch {}
  };

  const detectWebMAudio = (video: HTMLVideoElement) => {
    try {
      const audioTracks = (video as any).audioTracks;
      const webkitAudioDecodedByteCount = (video as any).webkitAudioDecodedByteCount;
      const hasWebMAudio = webkitAudioDecodedByteCount > 0;
      const audible = video.volume > 0 && !video.muted;
      const hasAudio = (audioTracks && audioTracks.length > 0) || hasWebMAudio || audible;
      setHasAudioTracks(hasAudio);
      if (!hasAudio && currentFormat === 'webm' && videoData?.formats?.mp4) {
        setAudioIssue('Audio might not be available in this WebM version. Trying fallback...');
        checkFallbackFormat(videoData.formats.mp4!);
      } else if (!hasAudio) setAudioIssue('No audio track detected in the video');
    } catch {}
  };

  const getSecureVideoUrl = useCallback(async () => {
    if (!videoData) return;
    try {
      const tokenForSession = generateFingerprint() + '_' + Date.now();
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL2}/videos/secure-url`,
        { videoId: videoData.id },
        { headers: { 'X-Session-Token': tokenForSession, Authorization: `Bearer ${accessToken}` } }
      );
      setVideoUrl(response.data.url);
      setSessionToken(tokenForSession);
      setIsVideoLoading(true);
    } catch {
      setError('Failed to get secure video URL');
    }
  }, [videoData, accessToken]);

  useEffect(() => {
    if (!videoData) return;
    checkCompressionStatus(videoData.id);
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => { getSecureVideoUrl(); }, 300);
    return () => { if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current); };
  }, [videoData, getSecureVideoUrl]);

  // ---- remaining (bootstrap) ----
  useEffect(() => {
    remainingRef.current = remainingSecs;
    overRef.current = (remainingSecs ?? 0) <= 0;
  }, [remainingSecs]);

  const fetchRemaining = useCallback(async () => {
    const vId = Number(id);
    if (!vId) return;
    try {
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${vId}/remaining`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();

      if (res.status === 401) {
        videoRef.current?.pause();
        setAuthError(true);
        return;
      }
      if (!res.ok) throw new Error(data?.error || 'remaining failed');

      const rem = typeof data?.remaining_seconds === 'number' ? data.remaining_seconds : null;
      setRemainingSecs(rem);
      remainingRef.current = rem;
      overRef.current = (rem ?? 0) <= 0;
    } catch (e) {
      // allow playback; we'll sync later
      console.warn('Remaining fetch failed:', e);
    }
  }, [id, accessToken]);

  useEffect(() => {
    if (!videoData) return;
    fetchRemaining();
    ensureTimer(); // start timer even if remaining is late
  }, [videoData, fetchRemaining]);

  const fetchRemainingOnceOnFirstPlay = useCallback(async () => {
    if (remainingRef.current == null) await fetchRemaining();
  }, [fetchRemaining]);

  // ---- tick (robust) ----
  async function postTickOnce(videoNumericId: number, secondsPlayed: number): Promise<boolean> {
    if (secondsPlayed < 1 || tickInFlightRef.current) return true;
    tickInFlightRef.current = true;
    try {
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${videoNumericId}/tick`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ played_seconds: Math.min(70, secondsPlayed) }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        if (res.status === 403) {
          videoRef.current?.pause();
          setRemainingSecs(0);
          remainingRef.current = 0;
          overRef.current = true;
          return false;
        } else if (res.status === 401) {
          videoRef.current?.pause();
          setAuthError(true);
        } else {
          console.error('Tick failed:', data);
        }
        return false;
      }

      if (typeof data?.remaining_seconds === 'number') {
        setRemainingSecs(data.remaining_seconds);
        remainingRef.current = data.remaining_seconds;
        overRef.current = data.remaining_seconds <= 0;
        if (overRef.current) videoRef.current?.pause();
      }
      return true;
    } catch (e) {
      console.error('Tick network error:', e);
      return false;
    } finally {
      tickInFlightRef.current = false;
    }
  }

  async function safePostTick(videoNumericId: number, secondsPlayed: number) {
    const ok = await postTickOnce(videoNumericId, secondsPlayed);
    if (ok) {
      backoffRef.current = 0;
    } else {
      // queue and retry with backoff
      queuedToSendRef.current += secondsPlayed;
      backoffRef.current = Math.min(5, backoffRef.current + 1);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(async () => {
        const vId = Number(id);
        if (!vId) return;
        const toSend = Math.min(70, Math.floor(queuedToSendRef.current));
        if (toSend > 0) {
          const ok2 = await postTickOnce(vId, toSend);
          if (ok2) {
            queuedToSendRef.current = Math.max(0, queuedToSendRef.current - toSend);
            backoffRef.current = 0;
          } else {
            backoffRef.current = Math.min(5, backoffRef.current + 1);
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(() => safePostTick(vId, 0), backoffRef.current * 2000);
          }
        }
      }, backoffRef.current * 2000);
    }
  }

  // ---- wall-clock loop (robust to minimize) ----
  function ensureTimer() {
    if (bootstrappedRef.current) return;

    isActivePlayRef.current = !!videoRef.current && !videoRef.current.paused && !overRef.current;
    lastWallClockRef.current = Date.now();

    if (!tickTimerRef.current) {
      tickTimerRef.current = setInterval(async () => {
        if (overRef.current) {
          videoRef.current?.pause();
          isActivePlayRef.current = false;
          return;
        }

        const now = Date.now();
        const dt = lastWallClockRef.current ? Math.max(0, (now - lastWallClockRef.current) / 1000) : 1;
        lastWallClockRef.current = now;

        if (isActivePlayRef.current) {
          if (typeof remainingRef.current === 'number' && remainingRef.current > 0) {
            remainingRef.current = Math.max(0, remainingRef.current - dt);
            setRemainingSecs(Math.floor(remainingRef.current));
            if (remainingRef.current <= 0.001) {
              overRef.current = true;
              videoRef.current?.pause();
            }
          }

          playedSincePostRef.current += dt;

          const totalPending = queuedToSendRef.current + playedSincePostRef.current;
          if (totalPending >= 60) {
            const toSend = Math.min(70, Math.floor(totalPending));
            queuedToSendRef.current = totalPending - toSend;
            playedSincePostRef.current = 0;
            await safePostTick(Number(id), toSend);
          }
        }
      }, 1000);
    }

    const onVis = async () => {
      if (document.hidden) {
        isActivePlayRef.current = false;
        const leftover = Math.floor(playedSincePostRef.current + queuedToSendRef.current);
        playedSincePostRef.current = 0;
        if (leftover >= 1) await safePostTick(Number(id), leftover);
      } else {
        lastWallClockRef.current = Date.now();
        if (videoRef.current && !videoRef.current.paused && !overRef.current) {
          isActivePlayRef.current = true;
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);

    bootstrappedRef.current = true;

    // cleanup hook for visibility listener
    return () => document.removeEventListener('visibilitychange', onVis);
  }

  // report time over (no side-effect in render)
  const reportTimeOver = useCallback(async () => {
    if (timeOverReportedRef.current) return;
    timeOverReportedRef.current = true;
    try {
      await fetch(`${defaultConfig.BASE_API_URL}/videos/${id}/time-over`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id })
      });
    } catch {}
  }, [id, accessToken]);

  useEffect(() => {
    if (typeof remainingSecs === 'number' && remainingSecs <= 0) {
      const v = videoRef.current;
      if (v && !v.paused) v.pause();
      reportTimeOver();
    }
  }, [remainingSecs, reportTimeOver]);

  // ---- drive timer from video events ----
  useEffect(() => {
    const v = videoRef.current;
    const vId = Number(id);
    if (!v || !vId) return;

    const setActive = (on: boolean) => { isActivePlayRef.current = on; };

    const onPlaying  = () => { setActive(true); lastWallClockRef.current = Date.now(); ensureTimer(); };
    const onPause    = () => setActive(false);
    const onWaiting  = () => setActive(false);
    const onSeeking  = () => setActive(false);
    const onSeeked   = () => { if (!v.paused) setActive(true); };
    const onEnded    = () => setActive(false);

    if (!tickTimerRef.current) ensureTimer();

    // safety bootstrap
    setTimeout(() => {
      if (!bootstrappedRef.current) ensureTimer();
    }, 2000);

    const flushLeftover = async () => {
      const leftover = Math.floor(playedSincePostRef.current + queuedToSendRef.current);
      playedSincePostRef.current = 0;
      queuedToSendRef.current = 0;
      if (leftover >= 1) await safePostTick(vId, leftover);
    };

    v.addEventListener('playing', onPlaying);
    v.addEventListener('pause', onPause);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('seeking', onSeeking);
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('ended', async () => { onEnded(); await flushLeftover(); });
    window.addEventListener('beforeunload', flushLeftover);
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) { setActive(false); await flushLeftover(); }
    });

    return () => {
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('seeking', onSeeking);
      v.removeEventListener('seeked', onSeeked);
      v.removeEventListener('ended', flushLeftover as any);
      window.removeEventListener('beforeunload', flushLeftover);
      document.removeEventListener('visibilitychange', flushLeftover as any);

      if (tickTimerRef.current) { clearInterval(tickTimerRef.current); tickTimerRef.current = null; }
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
      bootstrappedRef.current = false;
    };
  }, [id]);

  // ---- heartbeat ----
  const sendHeartbeat = useCallback(async () => {
    if (!sessionToken || !videoRef.current || videoRef.current.paused) return;
    try {
      const fingerprint = generateFingerprint();
      await axios.post(
        `${defaultConfig.BASE_API_URL2}/video/heartbeat`,
        { token: sessionToken },
        { headers: { 'X-Security-Fingerprint': fingerprint, Authorization: `Bearer ${accessToken}` } }
      );
    } catch {}
  }, [sessionToken, accessToken]);

  useEffect(() => {
    if (!sessionToken) return;
    const i = setInterval(sendHeartbeat, 240000);
    sendHeartbeat();
    return () => clearInterval(i);
  }, [sessionToken, sendHeartbeat]);

  // ---- player actions ----
  const handlePlayPause = async () => {
    const v = videoRef.current; if (!v) return;

    if (typeof remainingRef.current === 'number' && remainingRef.current <= 0) {
      v.pause();
      setIsPlaying(false);
      setShowControls(true);
      return;
    }

    if (v.paused) {
      await fetchRemainingOnceOnFirstPlay();
      v.play();
      setIsPlaying(true);
      isActivePlayRef.current = true;
      lastWallClockRef.current = Date.now();
      ensureTimer();
      scheduleAutoHide();
    } else {
      v.pause();
      setIsPlaying(false);
      isActivePlayRef.current = false;
      setShowControls(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value); setVolume(vol); if (videoRef.current) videoRef.current.volume = vol;
  };
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value); setCurrentTime(t); if (videoRef.current) videoRef.current.currentTime = t;
  };
  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setVolume(videoRef.current.muted ? 0 : 1); } };

  const toggleFullscreen = () => {
    const el = videoWrapperRef.current; if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      // @ts-ignore
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      setIsFullscreen(true);
      if (isMobileDevice()) lockToLandscape();
      scheduleAutoHide();
    } else {
      document.exitFullscreen?.();
      // @ts-ignore
      document.webkitExitFullscreen?.();
      setIsFullscreen(false);
      if (isMobileDevice()) unlockOrientation();
      scheduleAutoHide();
    }
  };

  const switchFormat = (f: 'webm' | 'mp4') => {
    if (!videoData?.formats) return;
    const newUrl = f === 'webm' ? videoData.formats.webm : videoData.formats.mp4;
    if (newUrl) { setVideoUrl(newUrl); setCurrentFormat(f); setAudioIssue(null); setIsVideoLoading(true); }
  };

  const handlePlaybackSpeedChange = (s: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = s; setPlaybackSpeed(s); setShowSpeedIndicator(true);
    if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    speedTimeoutRef.current = setTimeout(() => setShowSpeedIndicator(false), 1000);
  };

  const SKIP_SECONDS = 10;
  const skipBy = (d: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || Infinity, v.currentTime + d));
    wakeControls();
  };
  const skipBackward = () => skipBy(-SKIP_SECONDS);
  const skipForward  = () => skipBy(+SKIP_SECONDS);
  const handleInteract = () => wakeControls();

  // ---- video events + watermark ----
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    let wmEl: HTMLDivElement | null = null;
    let posTimer: NodeJS.Timeout | null = null;

    const v = videoRef.current;

    const onLoadStart   = () => setIsVideoLoading(true);
    const onWaiting     = () => setIsVideoLoading(true);
    const onCanPlay     = () => setIsVideoLoading(false);
    const onPlaying     = () => { setIsVideoLoading(false); setIsPlaying(true); isActivePlayRef.current = true; lastWallClockRef.current = Date.now(); scheduleAutoHide(); };
    const onStalled     = () => setIsVideoLoading(true);
    const onLoadedMeta  = () => { v.muted = false; v.volume = volume; detectWebMAudio(v); setDuration(v.duration); };
    const onTimeUpdate  = () => { setCurrentTime(v.currentTime); setProgress((v.currentTime / v.duration) * 100); };
    const onPlay        = () => { setIsPlaying(true); isActivePlayRef.current = true; lastWallClockRef.current = Date.now(); scheduleAutoHide(); };
    const onPause       = () => { setIsPlaying(false); isActivePlayRef.current = false; setShowControls(true); };
    const onVolChange   = () => setVolume(v.muted ? 0 : v.volume);
    const onError       = () => { setIsVideoLoading(false); setRetryCount((p) => p + 1); };

    const addWatermark = () => {
      const wrap = videoWrapperRef.current; if (!wrap) return;
      wrap.querySelectorAll('.watermark').forEach(el => el.remove());
      wmEl = document.createElement('div');
      wmEl.className = 'watermark';
      wmEl.style.cssText = `
        position:absolute;
        color:rgba(255,255,255,.7);
        padding:5px;
        font-size:7px; /* 50% smaller */
        pointer-events:none;
        user-select:none;
        text-shadow:1px 1px 2px rgba(0,0,0,.7);
        z-index:2147483647;
        font-family:Arial, sans-serif;
        white-space:nowrap;
      `;

      const ts = new Date().toISOString();
      // const rand = Math.random().toString(36).slice(2,10);
      wmEl.textContent = `User: ${everestId || 'unknown'} • ${ts.slice(0,10)}`;
      wrap.appendChild(wmEl);

      const updatePos = () => {
        if (!wmEl || !wrap || !v) return;
        const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
        const cw = fsEl ? window.innerWidth : wrap.getBoundingClientRect().width;
        const ch = fsEl ? window.innerHeight : wrap.getBoundingClientRect().height;

        let vw = cw, vh = ch, ox = 0, oy = 0;
        if (v.videoWidth && v.videoHeight) {
          const arV = v.videoWidth / v.videoHeight;
          const arC = cw / ch;
          if (arV > arC) { vw = cw; vh = cw / arV; ox = 0; oy = (ch - vh) / 2; }
          else { vw = ch * arV; vh = ch; ox = (cw - vw) / 2; oy = 0; }
        }
        const maxX = Math.max(0, vw - 200);
        const maxY = Math.max(0, vh - 30);
        const rx = Math.floor(Math.random() * maxX);
        const ry = Math.floor(Math.random() * maxY);
        wmEl.style.left = `${ox + rx}px`; wmEl.style.top = `${oy + ry}px`;
        wmEl.style.opacity = (Math.random() * 0.3 + 0.7).toFixed(2);
      };

      setTimeout(updatePos, 100);
      posTimer = setInterval(updatePos, 8000 + Math.random() * 4000);
      const onFSChange = () => setTimeout(updatePos, 200);
      document.addEventListener('fullscreenchange', onFSChange);
      // @ts-ignore
      document.addEventListener('webkitfullscreenchange', onFSChange);

      return () => {
        if (posTimer) clearInterval(posTimer);
        document.removeEventListener('fullscreenchange', onFSChange);
        // @ts-ignore
        document.removeEventListener('webkitfullscreenchange', onFSChange);
      };
    };

    const wmCleanup = addWatermark();

    v.addEventListener('loadstart', onLoadStart);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('stalled', onStalled);
    v.addEventListener('loadedmetadata', onLoadedMeta);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('volumechange', onVolChange);
    v.addEventListener('error', onError);

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (['s','S','u','U'].includes(e.key) || (e.shiftKey && ['I','i'].includes(e.key)) || e.key === 'F12')) {
        e.preventDefault(); e.stopPropagation();
      }
    };
    const onCtx = (e: MouseEvent) => { if (e.target === v) e.preventDefault(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('contextmenu', onCtx);

    return () => {
      wmCleanup?.();
      v.removeEventListener('loadstart', onLoadStart);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('stalled', onStalled);
      v.removeEventListener('loadedmetadata', onLoadedMeta);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('volumechange', onVolChange);
      v.removeEventListener('error', onError);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('contextmenu', onCtx);
    };
  }, [videoUrl, volume, everestId, scheduleAutoHide]);

  // ---- UI helpers ----
  const ALWAYS_SHOW_CENTER_IN_FULLSCREEN = false;
  const showCenterButtons = !isVideoLoading && (ALWAYS_SHOW_CENTER_IN_FULLSCREEN ? (isFullscreen || showControls) : showControls);

  // const formatRemaining = (secs: number | null) => {
  //   if (secs === null || secs < 0) return '—';
  //   const m = Math.floor(secs / 60);
  //   const s = Math.floor(secs % 60);
  //   return `${m}:${s.toString().padStart(2, '0')}`;
  // };
  
  const formatRemaining = (secs: number | null) => {
  if (secs === null || secs < 0) return '—';

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);

  return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="p-1">

            {compressionStatus === 'processing' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span className="text-yellow-800 font-medium">
                    {currentFormat === 'webm' ? 'Optimizing WebM version...' : 'Processing video...'}
                  </span>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-8 border-purple-200 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 border-t-8 border-purple-600 rounded-full animate-spin"></div>
                </div>
                <p className="mt-6 text-lg text-purple-700 font-medium">Preparing your video...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-600 font-medium text-lg">{error}</p>
                <p className="mt-2 text-sm text-gray-500">{retryCount > 0 ? 'Attempting recovery...' : 'Check console for more details'}</p>
                {retryCount >= 2 && (
                  <button onClick={() => window.location.reload()} className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                    Refresh Page
                  </button>
                )}
              </div>
            )}

            {/* Player */}
            {videoUrl && !loading && !error && (
              <div className="mt-4 w-full flex flex-col items-center relative">

                {audioIssue && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8.464 15.536a5 5 0 01-7.072-7.072" />
                      </svg>
                      <span>{audioIssue}</span>
                    </div>
                  </div>
                )}

                <div
                  ref={videoWrapperRef}
                  className={`relative w-full overflow-hidden shadow-2xl transition-all duration-300 bg-black flex items-center justify-center ${isFullscreen ? 'rounded-none' : 'rounded-xl'}`}
                  onMouseMove={handleInteract}
                  onTouchStart={handleInteract}
                  onClick={handleInteract}
                >
                  {/* Time badge */}
                  {typeof remainingSecs === 'number' && (
                    <div className="absolute right-3 top-3 z-[10001]">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${remainingSecs <= 60 ? 'bg-red-600 text-white' : 'bg-white/90 text-gray-800'}`}>
                        Time Left: {formatRemaining(remainingSecs)}
                      </span>
                    </div>
                  )}

                  {/* Time over overlay */}
                  {typeof remainingSecs === 'number' && remainingSecs <= 0 && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-[10002]">
                      <div className="bg-white rounded-lg px-5 py-4 text-center max-w-xs shadow-xl">
                        <div className="text-red-600 font-bold mb-1">Time Limit Reached</div>
                        <div className="text-sm text-gray-700">Your watch time for this video has ended.</div>
                      </div>
                    </div>
                  )}

                  {/* Auth overlay */}
                  {authError && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-[10002]">
                      <div className="bg-white rounded-lg px-5 py-4 text-center max-w-xs shadow-xl">
                        <div className="text-red-600 font-bold mb-1">Multiple session occurred</div>
                        <div className="text-sm text-gray-700">Please sign in again to continue.</div>
                      </div>
                    </div>
                  )}

                  {/* Video */}
                  <video
                    ref={videoRef}
                    className="w-full h-full max-h-screen object-contain"
                    crossOrigin="anonymous"
                    controlsList="nodownload"
                    disablePictureInPicture
                    playsInline
                    preload="auto"
                    muted={false}
                    onLoadStart={() => setIsVideoLoading(true)}
                    onWaiting={() => setIsVideoLoading(true)}
                    onCanPlay={() => setIsVideoLoading(false)}
                    onPlaying={() => { setIsVideoLoading(false); setIsPlaying(true); isActivePlayRef.current = true; lastWallClockRef.current = Date.now(); scheduleAutoHide(); }}
                    onStalled={() => setIsVideoLoading(true)}
                    onLoadedMetadata={() => {
                      const v = videoRef.current; if (v) { v.muted = false; v.volume = volume; detectWebMAudio(v); setDuration(v.duration); }
                    }}
                    onTimeUpdate={() => {
                      const v = videoRef.current; if (v) { setCurrentTime(v.currentTime); setProgress((v.currentTime / v.duration) * 100); }
                    }}
                    onPlay={async () => {
                      setIsPlaying(true);
                      isActivePlayRef.current = true;
                      lastWallClockRef.current = Date.now();
                      await fetchRemainingOnceOnFirstPlay();
                      ensureTimer();
                      scheduleAutoHide();
                    }}
                    onPause={() => { setIsPlaying(false); isActivePlayRef.current = false; setShowControls(true); }}
                    onVolumeChange={() => { const v = videoRef.current; if (v) setVolume(v.muted ? 0 : v.volume); }}
                    onError={(e) => { const v = e.currentTarget; setIsVideoLoading(false); if (v.error?.code === 4) setError(`Video loading failed: ${v.error.message}`); }}
                  >
                    <source src={videoUrl!} type={`video/${currentFormat}`} />
                  </video>

                  {/* CENTER OVERLAY */}
                  <div className="absolute inset-0 z-[10000] flex items-center justify-center pointer-events-none">
                    {isVideoLoading && (
                      <div className="pointer-events-none flex flex-col items-center justify-center">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                          <div className="absolute inset-0 border-t-4 border-white rounded-full animate-spin"></div>
                        </div>
                        <div className="mt-3 text-white/90 text-sm font-medium">Loading video…</div>
                      </div>
                    )}

                    {!isVideoLoading && showCenterButtons && (
                      <div className="pointer-events-auto flex items-center gap-6 bg-black/35 rounded-full px-4 sm:px-5 py-3 backdrop-blur-sm shadow-lg transform origin-center scale-50">
                        <button
                          onClick={skipBackward}
                          className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-white/40"
                          aria-label="Back 10 seconds"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l-4-2m8 10a9 9 0 1 1 0-18" />
                          </svg>
                        </button>

                        <button
                          onClick={handlePlayPause}
                          className="p-4 sm:p-5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-white/40"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 sm:h-10 sm:w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6M14 9v6" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 sm:h-10 sm:w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={skipForward}
                          className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-white/40"
                          aria-label="Forward 10 seconds"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4-2m-8 10a9 9 0 1 0 0-18" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center mb-2">
                      <span className="text-white text-xs mr-2">{Math.floor(currentTime/60)}:{`${Math.floor(currentTime%60)}`.padStart(2,'0')}</span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button onClick={handlePlayPause} disabled={typeof remainingSecs === 'number' && remainingSecs <= 0} className={`text-white transition-colors ${typeof remainingSecs === 'number' && remainingSecs <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:text-purple-300'}`}>
                          {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6M14 9v6" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          )}
                        </button>

                        <div className="flex items-center space-x-2">
                          <button onClick={toggleMute} className="text-white hover:text-purple-300 transition-colors">
                            {volume === 0 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                            )}
                          </button>
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

                      <div className="flex items-center space-x-4">
                        <div className="relative group">
                          <button className="text-white hover:text-purple-300 transition-colors flex items-center">
                            <span className="text-sm mr-1">{currentFormat.toUpperCase()}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            {videoData?.formats?.webm && (
                              <button onClick={() => switchFormat('webm')} className={`block w-full text-left px-4 py-2 text-sm ${currentFormat === 'webm' ? 'text-purple-400' : 'text-white hover:bg-gray-700'}`}>
                                WebM
                              </button>
                            )}
                            {videoData?.formats?.mp4 && (
                              <button onClick={() => switchFormat('mp4')} className={`block w-full text-left px-4 py-2 text-sm ${currentFormat === 'mp4' ? 'text-purple-400' : 'text-white hover:bg-gray-700'}`}>
                                MP4
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="relative group mr-2 sm:mr-4">
                          <button className="text-white hover:text-purple-300 transition-colors flex items-center">
                            <span className="text-sm mr-1">{playbackSpeed}x</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            {[0.25,0.5,0.75,1,1.25,1.5,1.75,2].map(s => (
                              <button key={s} onClick={() => handlePlaybackSpeedChange(s)} className={`block w-full text-left px-4 py-2 text-sm ${playbackSpeed===s ? 'text-purple-400' : 'text-white hover:bg-gray-700'}`}>
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <button onClick={toggleFullscreen} className="text-white hover:text-purple-300 transition-colors">
                          {isFullscreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {showSpeedIndicator && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-bold">
                      {playbackSpeed}x
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
