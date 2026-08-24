import { useState, useRef, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { defaultConfig } from '../../App/configs/common';
import { toast } from 'react-toastify';

interface VideoData {
  id: number;
  title: string;
  videoId: number;
  formats?: {
    webm?: string;
    mp4?: string;
  };
}

export default function ViewPage() {
  const { videoId, id ,class_id } = useParams<{ videoId: string; id: string ; class_id: string}>();

  // ---- meta + video url ----
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState<string>('ready');
  const [audioIssue, setAudioIssue] = useState<string | null>(null);
  const [, setHasAudioTracks] = useState<boolean | null>(null);
  const [currentFormat, setCurrentFormat] = useState<'webm' | 'mp4'>('webm');

  // ---- elements ----
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  // ---- secure url/session ----
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [, setUrlExpiration] = useState<number>(0);
  const [cachedUrl, setCachedUrl] = useState<{ url: string; expires: number } | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ---- UI controls ----
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState<boolean>(false);
  const speedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [showSkipIndicator] = useState<{ side: 'left' | 'right'; count: number } | null>(null);

  // ---- quota/timer state ----
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const [, setQuotaError] = useState<string | null>(null);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playedSincePostRef = useRef<number>(0);
  const isActivePlayRef = useRef<boolean>(false);
  const tickInFlightRef = useRef<boolean>(false);

  // robust timing + retry helpers
  const remainingRef = useRef<number | null>(null);
  const overRef = useRef<boolean>(false);
  const bootstrappedRef = useRef<boolean>(false);
  const lastWallClockRef = useRef<number | null>(null);
  const pendingToSendRef = useRef<number>(0);
  const backoffRef = useRef<number>(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // time-over reporting (only once)
  const timeOverReportedRef = useRef(false);

  // ---------------- helpers ----------------
  const generateFingerprint = (): string => {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      (window.screen as any).colorDepth,
      `${window.screen.width}x${window.screen.height}`,
      (navigator as any).hardwareConcurrency,
      !!window.sessionStorage,
      !!window.localStorage,
      !!window.indexedDB,
    ];
    return btoa(components.join('|||')).replace(/=/g, '').substring(0, 32);
  };

  // const formatTime = (time: number) => {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = Math.floor(time % 60);
  //   return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  // };

  const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};


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
  // keep refs in sync with state
  useEffect(() => {
    remainingRef.current = remainingSecs;
    overRef.current = (remainingSecs ?? 0) <= 0;
  }, [remainingSecs]);

  // ---------------- metadata + secure URL ----------------
  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided');
      setLoading(false);
      return;
    }
    const fetchVideoMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const fingerprint = generateFingerprint();
        const res = await fetch(`${defaultConfig.BASE_API_URL2}/videos`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Security-Fingerprint': fingerprint,
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          credentials: 'include',
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Authentication required. Please login.');
          if (res.status === 403) throw new Error('Access forbidden. Security validation failed.');
          throw new Error('No video found');
        }
        const data = await res.json();
        if (!data.videos || data.videos.length === 0) throw new Error('No videos available');

        const specificVideo = data.videos.find((video: VideoData) => video.id === parseInt(videoId));
        if (!specificVideo) throw new Error(`Video with ID ${videoId} not found`);

        setVideoData(specificVideo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No video found. Please upload one first.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideoMetadata();
  }, [videoId]);

  const checkCompressionStatus = async (videoIdNum: number) => {
    try {
      const response = await fetch(`${defaultConfig.BASE_API_URL2}/video/${videoIdNum}/compression-status`);
      if (!response.ok) return;
      const data = await response.json();
      setCompressionStatus(data.status);
      if (data.status === 'processing') {
        setTimeout(() => checkCompressionStatus(videoIdNum), 3000);
      }
    } catch (error) {
      console.error('Error checking compression status:', error);
    }
  };

  const checkFallbackFormat = async (fallbackUrl: string) => {
    try {
      const response = await fetch(fallbackUrl, { method: 'HEAD' });
      if (response.ok) {
        setVideoUrl(fallbackUrl);
        setCurrentFormat('mp4');
        setAudioIssue(null);
      } else {
        setAudioIssue('No audio track available in any format');
      }
    } catch (err) {
      console.error('Fallback format check failed:', err);
    }
  };

  const detectWebMAudio = (video: HTMLVideoElement) => {
    try {
      const audioTracks = (video as any).audioTracks;
      const webkitAudioDecodedByteCount = (video as any).webkitAudioDecodedByteCount;
      const hasWebMAudio = webkitAudioDecodedByteCount > 0;
      const isActuallyPlayingAudio = video.volume > 0 && !video.muted;
      const hasAudio = (audioTracks && audioTracks.length > 0) || hasWebMAudio || isActuallyPlayingAudio;
      setHasAudioTracks(hasAudio);
      if (!hasAudio && currentFormat === 'webm' && videoData?.formats?.mp4) {
        setAudioIssue('Audio might not be available in this WebM version. Trying fallback...');
        checkFallbackFormat(videoData.formats.mp4);
      } else if (!hasAudio) {
        setAudioIssue('No audio track detected in the video');
      }
    } catch (err) {
      console.error('Audio detection error:', err);
    }
  };

  const getSecureVideoUrl = useCallback(async () => {
    if (!videoData) return;

    const now = Date.now();
    if (cachedUrl && cachedUrl.expires > now + 60000) {
      setVideoUrl(cachedUrl.url);
      setSessionToken(localStorage.getItem('video_session_token'));
      return;
    }
    setLoading(true);
    try {
      const sessionTokenTmp = generateFingerprint() + '_' + Date.now();
      const fingerprint = generateFingerprint();
      const authToken = localStorage.getItem('access_token');
      const requestVideoId = videoData.id;

      const response = await axios.post(
        `${defaultConfig.BASE_API_URL2}/videos/secure-url`,
        { videoId: requestVideoId },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Security-Fingerprint': fingerprint,
            'X-Session-Token': sessionTokenTmp,
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
          withCredentials: true,
        }
      );

      if (response.data?.url) {
        const preferredUrl = response.data.formats?.webm || response.data.url;
        const expiresAt = new Date(response.data.expires_at).getTime();

        setCachedUrl({ url: preferredUrl, expires: expiresAt });
        setVideoUrl(preferredUrl);
        setCurrentFormat(response.data.formats?.webm ? 'webm' : 'mp4');
        setSessionToken(response.data.token);
        setUrlExpiration(expiresAt);
        localStorage.setItem('video_session_token', response.data.token);
        setError(null);
      } else {
        throw new Error('No video URL in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get video URL';
      setError(errorMessage);
      if (err instanceof AxiosError && err.response?.status === 404) {
        setError('Video file not found on server');
      }
    } finally {
      setLoading(false);
    }
  }, [videoData, cachedUrl]);

  useEffect(() => {
    if (!videoData) return;

    checkCompressionStatus(videoData.id);

    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => {
      getSecureVideoUrl();
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [videoData, getSecureVideoUrl]);

  // ---------------- remaining (bootstrap) ----------------
  useEffect(() => {
    const vId = Number(id);
    if (!videoData || !vId) return;

    (async () => {
      try {
        const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${vId}/remaining`, {
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
        remainingRef.current = rem;
        overRef.current = (rem ?? 0) <= 0;

        ensureTimer(); // start ticking immediately regardless of API latency
      } catch (e) {
        console.warn('Remaining fetch failed:', e);
        // allow playback; we’ll fetch again on first play and/or during tick success
        ensureTimer();
      }
    })();
  }, [videoData, id]);

  // fetch once again on first play if remaining was unknown
  const fetchRemainingOnce = async () => {
    try {
      const vId = Number(id);
      if (!vId) return;
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${vId}/remaining`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      const data = await res.json();
      if (res.status === 200 && typeof data?.remaining_seconds === 'number') {
        setRemainingSecs(data.remaining_seconds);
        remainingRef.current = data.remaining_seconds;
        overRef.current = data.remaining_seconds <= 0;
      }
    } catch {}
  };

  // ---------------- tick (robust) ----------------
  async function postTickOnce(videoNumericId: number, secondsPlayed: number): Promise<boolean> {
    if (secondsPlayed < 1 || tickInFlightRef.current) return true;
    tickInFlightRef.current = true;

    try {
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${videoNumericId}/tick`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ played_seconds: Math.min(70, secondsPlayed) }),
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
          remainingRef.current = 0;
          overRef.current = true;
          return false;
        } else if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('authToken');
          window.location.href = '/';
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
      pendingToSendRef.current += secondsPlayed;
      backoffRef.current = Math.min(5, backoffRef.current + 1);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(async () => {
        const vId = Number(id);
        if (!vId) return;
        const toSend = Math.min(70, Math.floor(pendingToSendRef.current));
        if (toSend > 0) {
          const ok2 = await postTickOnce(vId, toSend);
          if (ok2) {
            pendingToSendRef.current = Math.max(0, pendingToSendRef.current - toSend);
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

  // wall-clock based 1Hz loop (robust to throttling/minimize)
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
          // optimistic countdown
          if (typeof remainingRef.current === 'number' && remainingRef.current > 0) {
            remainingRef.current = Math.max(0, remainingRef.current - dt);
            setRemainingSecs(Math.floor(remainingRef.current));
            if (remainingRef.current <= 0.001) {
              overRef.current = true;
              videoRef.current?.pause();
            }
          }

          // accumulate wall-clock seconds
          playedSincePostRef.current += dt;

          // send every >= 60 seconds of real play
          const totalPending = pendingToSendRef.current + playedSincePostRef.current;
          if (totalPending >= 60) {
            const toSend = Math.min(70, Math.floor(totalPending));
            pendingToSendRef.current = totalPending - toSend;
            playedSincePostRef.current = 0;
            await safePostTick(Number(id), toSend);
          }
        }
      }, 1000);
    }

    // visibility (pause counting when hidden; flush leftover)
    const onVis = async () => {
      if (document.hidden) {
        isActivePlayRef.current = false;
        const leftover = Math.floor(playedSincePostRef.current + pendingToSendRef.current);
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

    // cleanup visibility listener on unmount
    return () => document.removeEventListener('visibilitychange', onVis);
  }

  // pause if remaining hits 0
  useEffect(() => {
    if (typeof remainingSecs === 'number' && remainingSecs <= 0) {
      const v = videoRef.current;
      if (v && !v.paused) v.pause();
      reportTimeOver(); // notify backend once
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSecs]);

  // ---------------- heartbeat ----------------
  const sendHeartbeat = useCallback(async () => {
    if (!sessionToken || !videoRef.current || videoRef.current.paused) return;
    try {
      const fingerprint = generateFingerprint();
      await axios.post(
        `${defaultConfig.BASE_API_URL2}/video/heartbeat`,
        { token: sessionToken },
        {
          headers: {
            'X-Security-Fingerprint': fingerprint,
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );
    } catch (error) {
      console.warn('Heartbeat failed:', error);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionToken) return;
    const interval = setInterval(sendHeartbeat, 240000);
    sendHeartbeat();
    return () => clearInterval(interval);
  }, [sessionToken, sendHeartbeat]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePlayBeat = () => sendHeartbeat();
    video.addEventListener('play', handlePlayBeat);
    return () => video.removeEventListener('play', handlePlayBeat);
  }, [sendHeartbeat]);

  // ---------------- time-over notification ----------------
  const reportTimeOver = useCallback(async () => {
    if (timeOverReportedRef.current) return;
    timeOverReportedRef.current = true;
    try {
      await fetch(`${defaultConfig.BASE_API_URL}/videos/${id}/time-over`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      console.log('✅ Time over reported to backend');
    } catch (err) {
      console.error('❌ Failed to report time over:', err);
    }
  }, [id]);

  // ---------------- video element wiring ----------------
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      if (remainingSecs == null) fetchRemainingOnce(); // try to fetch on first play if unknown
      videoRef.current.play();
      setIsPlaying(true);
      isActivePlayRef.current = true;
      lastWallClockRef.current = Date.now(); // start wall-clock baseline
      ensureTimer();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      isActivePlayRef.current = false;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) videoRef.current.currentTime = newTime;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVolume(videoRef.current.muted ? 0 : 1);
    }
  };

  const toggleFullscreen = () => {
    if (!videoWrapperRef.current) return;
    if (!document.fullscreenElement) {
      if (videoWrapperRef.current.requestFullscreen) {
        videoWrapperRef.current.requestFullscreen();
      } else if ((videoWrapperRef.current as any).webkitRequestFullscreen) {
        (videoWrapperRef.current as any).webkitRequestFullscreen();
      } else if ((videoWrapperRef.current as any).mozRequestFullScreen) {
        (videoWrapperRef.current as any).mozRequestFullScreen();
      } else if ((videoWrapperRef.current as any).msRequestFullscreen) {
        (videoWrapperRef.current as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const switchFormat = (format: 'webm' | 'mp4') => {
    if (!videoData?.formats) return;
    const newUrl = format === 'webm' ? videoData.formats.webm : videoData.formats.mp4;
    if (newUrl) {
      setVideoUrl(newUrl);
      setCurrentFormat(format);
      setAudioIssue(null);
    }
  };

  const handlePlaybackSpeedChange = (speed: number): void => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedIndicator(true);
      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
      speedTimeoutRef.current = setTimeout(() => setShowSpeedIndicator(false), 1000);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent): void => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    const SKIP_AMOUNT = 10;

    const tapX = 'clientX' in e ? e.clientX : (e as React.TouchEvent).touches[0].clientX;
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const isLeftSide = tapX < rect.left + rect.width / 2;

    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      if (!videoRef.current) return;
      if (isLeftSide) {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - SKIP_AMOUNT);
      } else {
        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + SKIP_AMOUNT);
      }
    }
    setLastTapTime(now);
  };

  // watermark + element listeners
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    let currentWatermark: HTMLDivElement | null = null;
    let positionInterval: NodeJS.Timeout | null = null;

    const handleLoadedMetadata = () => {
      const video = videoRef.current!;
      video.muted = false;
      video.volume = volume;
      detectWebMAudio(video);
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      isActivePlayRef.current = true;
      lastWallClockRef.current = Date.now();
      ensureTimer();
    };

    const handlePause = () => {
      setIsPlaying(false);
      isActivePlayRef.current = false;
    };

    const handleVolumeChangeLocal = () => {
      if (videoRef.current) setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
    };

    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const error = video.error;
      if (error?.code === 3) {
        setAudioIssue('Video decoding error - this might affect audio playback');
      } else if (error?.code === 4) {
        setRetryCount((prev) => prev + 1);
      }
    };

    const addWatermark = () => {
      if (!videoRef.current || !videoWrapperRef.current) return;

      // Remove existing watermarks
      const existingWatermarks = videoWrapperRef.current.querySelectorAll('.watermark');
      existingWatermarks.forEach((el) => el.remove());

      const watermark = document.createElement('div');
      watermark.className = 'watermark';
      watermark.style.cssText = `
        position: absolute;
        color: rgba(255, 255, 255, 0.7);
        padding: 5px;
        font-size: 8px;
        pointer-events: none;
        user-select: none;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        z-index: 2147483647;
        font-family: Arial, sans-serif;
        white-space: nowrap;
      `;

      const userId = localStorage.getItem('evrest_id');
      const timestamp = new Date().toISOString();
      const randomId = Math.random().toString(36).substring(2, 10);
      watermark.textContent = `User: ${userId} • ID: ${randomId} • ${timestamp.substring(0, 10)}`;

      videoWrapperRef.current.appendChild(watermark);
      currentWatermark = watermark;

      const updatePosition = () => {
        if (!videoRef.current || !currentWatermark || !videoWrapperRef.current) return;

        const fullscreenElement =
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement;

        let containerWidth: number, containerHeight: number;
        if (fullscreenElement) {
          containerWidth = window.innerWidth;
          containerHeight = window.innerHeight;
        } else {
          const wrapperRect = videoWrapperRef.current.getBoundingClientRect();
          containerWidth = wrapperRect.width;
          containerHeight = wrapperRect.height;
        }

        const videoElement = videoRef.current!;
        let actualVideoWidth: number, actualVideoHeight: number, offsetX: number, offsetY: number;

        if (videoElement.videoWidth && videoElement.videoHeight) {
          const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;
          const containerAspectRatio = containerWidth / containerHeight;

          if (videoAspectRatio > containerAspectRatio) {
            actualVideoWidth = containerWidth;
            actualVideoHeight = containerWidth / videoAspectRatio;
            offsetX = 0;
            offsetY = (containerHeight - actualVideoHeight) / 2;
          } else {
            actualVideoWidth = containerHeight * videoAspectRatio;
            actualVideoHeight = containerHeight;
            offsetX = (containerWidth - actualVideoWidth) / 2;
            offsetY = 0;
          }
        } else {
          actualVideoWidth = containerWidth;
          actualVideoHeight = containerHeight;
          offsetX = 0;
          offsetY = 0;
        }

        const watermarkWidth = 200;
        const watermarkHeight = 30;
        const maxX = Math.max(0, actualVideoWidth - watermarkWidth);
        const maxY = Math.max(0, actualVideoHeight - watermarkHeight);
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);

        currentWatermark.style.left = `${offsetX + randomX}px`;
        currentWatermark.style.top = `${offsetY + randomY}px`;
        currentWatermark.style.opacity = (Math.random() * 0.3 + 0.7).toFixed(2);
      };

      const handleResize = () => setTimeout(updatePosition, 100);

      const handleFullscreenChange = () => {
        if (currentWatermark) {
          currentWatermark.remove();
          currentWatermark = null;
        }
        setTimeout(() => {
          if (!currentWatermark && videoWrapperRef.current) {
            const newWatermark = document.createElement('div');
            newWatermark.className = 'watermark';
            newWatermark.style.cssText = watermark.style.cssText;
            newWatermark.textContent = watermark.textContent;
            videoWrapperRef.current!.appendChild(newWatermark);
            currentWatermark = newWatermark;
            updatePosition();
          }
        }, 200);
      };

      setTimeout(updatePosition, 100);
      window.addEventListener('resize', handleResize);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange as any);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange as any);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange as any);

      if (videoRef.current) {
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoRef.current.addEventListener('resize', handleResize as any);
        videoRef.current.addEventListener('play', handlePlay);
        videoRef.current.addEventListener('pause', handlePause);
        videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
        videoRef.current.addEventListener('volumechange', handleVolumeChangeLocal);
        videoRef.current.addEventListener('error', handleError as any);
      }

      positionInterval = setInterval(() => {
        updatePosition();
      }, 8000 + Math.random() * 4000);

      return () => {
        if (positionInterval) clearInterval(positionInterval);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange as any);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange as any);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange as any);

        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoRef.current.removeEventListener('resize', handleResize as any);
          videoRef.current.removeEventListener('play', handlePlay);
          videoRef.current.removeEventListener('pause', handlePause);
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          videoRef.current.removeEventListener('volumechange', handleVolumeChangeLocal);
          videoRef.current.removeEventListener('error', handleError as any);
        }

        if (currentWatermark) currentWatermark.remove();
      };
    };

    const watermarkCleanup = addWatermark();

    const handleKeyDown = (e: KeyboardEvent) => {
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
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    const handleContextMenu = (e: MouseEvent) => {
      if (e.target === videoRef.current) e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      if (watermarkCleanup) watermarkCleanup();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
      bootstrappedRef.current = false;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, volume]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="mb-6">
          <button
          onClick={() => (window.location.href = `/singleclass/${class_id}`)}
            className="inline-flex items-center px-4 py-2 bg-white text-purple-700 rounded-lg shadow-sm hover:bg-purple-50 transition-all duration-300 border border-purple-100 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
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
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="ml-4 text-3xl font-bold bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  {videoData?.title || 'Secure Video Player'}
                </h2>
              </div>

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
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-purple-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-t-8 border-purple-600 rounded-full animate-spin"></div>
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
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-md"
                    >
                      Refresh Page
                    </button>
                  )}
                </div>
              )}

              {typeof remainingSecs === 'number' && remainingSecs <= 0 && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70">
                  <div className="px-5 py-4 rounded-xl bg-white text-gray-900 shadow-lg">
                    <div className="text-lg font-semibold">Time’s up</div>
                    <div className="text-sm text-gray-600 mt-1">Your viewing time for this video has ended.</div>
                  </div>
                </div>
              )}

              {videoUrl && !loading && !error && (
                <div ref={containerRef} className="mt-4 w-full flex flex-col items-center relative">
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
                    className="relative w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-[1.01]"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setShowControls(false)}
                    onTouchStart={handleDoubleTap}
                    onClick={handleDoubleTap}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none rounded-xl"></div>

                    {/* Remaining badge */}
                    {typeof remainingSecs === 'number' && (
                      <div className="absolute right-3 top-3 z-20">
                        <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-xs font-semibold border border-white/10">
                          Remaining: {formatRemaining(remainingSecs)}
                        </div>
                      </div>
                    )}

                    <video
                      ref={videoRef}
                      crossOrigin="anonymous"
                      className="w-full rounded-xl"
                      controlsList="nodownload"
                      disablePictureInPicture
                      playsInline
                      preload="auto"
                      muted={false}
                      onLoadedMetadata={() => {
                        const v = videoRef.current;
                        if (v) {
                          v.muted = false;
                          v.volume = volume;
                          detectWebMAudio(v);
                          setDuration(v.duration);
                        }
                      }}
                      onError={(e) => {
                        const v = e.currentTarget;
                        if (v.error?.code === 4) setError(`Video loading failed: ${v.error.message}`);
                      }}
                    >
                      {videoUrl ? (
                        <source src={videoUrl} type={`video/${currentFormat}`} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">No video URL available</div>
                      )}
                    </video>

                    {/* Custom Controls */}
                    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                      {/* Progress */}
                      <div className="flex items-center mb-2">
                        <span className="text-white text-xs mr-2">{formatTime(currentTime)}</span>
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleProgressChange}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                        />
                        <span className="text-white text-xs ml-2">{formatTime(duration)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Play/Pause */}
                          <button
                            onClick={handlePlayPause}
                            disabled={typeof remainingSecs === 'number' && remainingSecs <= 0}
                            className={`text-white transition-colors ${
                              typeof remainingSecs === 'number' && remainingSecs <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:text-purple-300'
                            }`}
                          >
                            {isPlaying ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              </svg>
                            )}
                          </button>

                          {/* Volume */}
                          <div className="flex items-center space-x-2">
                            <button onClick={toggleMute} className="text-white hover:text-purple-300 transition-colors">
                              {volume === 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
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
                          {/* Format */}
                          <div className="relative group mr-4">
                            <button className="text-white hover:text-purple-300 transition-colors flex items-center">
                              <span className="text-sm mr-1">{currentFormat.toUpperCase()}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {videoData?.formats?.webm && (
                                <button
                                  onClick={() => switchFormat('webm')}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    currentFormat === 'webm' ? 'text-purple-400' : 'text-white hover:bg-gray-700'
                                  }`}
                                >
                                  WebM
                                </button>
                              )}
                              {videoData?.formats?.mp4 && (
                                <button
                                  onClick={() => switchFormat('mp4')}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    currentFormat === 'mp4' ? 'text-purple-400' : 'text-white hover:bg-gray-700'
                                  }`}
                                >
                                  MP4
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Speed */}
                          <div className="relative group mr-4">
                            <button className="text-white hover:text-purple-300 transition-colors flex items-center">
                              <span className="text-sm mr-1">{playbackSpeed}x</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => handlePlaybackSpeedChange(speed)}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    playbackSpeed === speed ? 'text-purple-400' : 'text-white hover:bg-gray-700'
                                  }`}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Fullscreen */}
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
                  </div>

                  {showSpeedIndicator && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-bold">
                      {playbackSpeed}x
                    </div>
                  )}

                  {showSkipIndicator && (
                    <div
                      className={`absolute top-1/2 ${
                        showSkipIndicator.side === 'left' ? 'left-12' : 'right-12'
                      } transform -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-full`}
                    >
                      <div className="flex items-center">
                        {showSkipIndicator.side === 'left' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        )}
                        <span className="ml-2">{showSkipIndicator.count}s</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-2">
                    {videoData?.formats?.webm && (
                      <button
                        onClick={() => switchFormat('webm')}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentFormat === 'webm' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        WebM
                      </button>
                    )}
                    {videoData?.formats?.mp4 && (
                      <button
                        onClick={() => switchFormat('mp4')}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentFormat === 'mp4' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        MP4
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
