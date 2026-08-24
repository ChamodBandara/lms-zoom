// src/pages/ViewPage2.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { defaultConfig } from "../../App/configs/common";

// ✅ use player.vampior.com for API + streaming
const API_BASE = "https://player.vampior.com/api";

// ✅ if backend returns old domains, strip them to relative path
const toRelative = (u?: string) =>
  u ? u.replace(/^https?:\/\/(dev3\.eoe\.lk|dev4\.eoe\.lk|player\.vampior\.com)/i, "") : u;

// ✅ cache-buster
const addBuster = (u: string) => `${u}${u.includes("?") ? "&" : "?"}t=${Date.now()}`;

// ✅ force ALL HLS requests to go through player.vampior.com (manifest + ts + keys)
const FORCE_HOST = "https://player.vampior.com";
const rewriteToPlayerDomain = (url: string) => {
  if (!url) return url;

  url = url.replace(/^https?:\/\/dev4\.eoe\.lk/i, FORCE_HOST);
  url = url.replace(/^https?:\/\/dev3\.eoe\.lk/i, FORCE_HOST);

  if (url.startsWith("/")) return `${FORCE_HOST}${url}`;
  if (url.startsWith(FORCE_HOST)) return url;

  return url;
};

// buffering targets
const TARGET_REBUFFER = 30;
const TARGET_FIRST_START = 5;

// -------- Quality types --------
type QualityHeight = number | "auto";
type QualityOption = { label: string; height: QualityHeight };

function safeNum(n: number | undefined | null) {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

export default function ViewPage2() {
  const { videoId, id, class_id } = useParams<{ videoId: string; id: string; class_id: string }>();

  // --- refs ---
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // ✅ keep React DOM video element ref (do NOT replace it with tech el)
  const videoDomRef = useRef<HTMLVideoElement | null>(null);

  // ✅ separate ref for tech video element (for buffered calc)
  const techVideoRef = useRef<HTMLVideoElement | null>(null);

  const playerRef = useRef<Player | null>(null);

  // --- data ---
  const [meta, setMeta] = useState<any>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- quota ---
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const remainingRef = useRef<number | null>(null); // ✅ always-latest remaining
  const timeOverReportedRef = useRef(false);

  useEffect(() => {
    remainingRef.current = remainingSecs;
  }, [remainingSecs]);

  // --- buffering UI ---
  const [buffering, setBuffering] = useState(false);
  const rebufferingRef = useRef(false);
  const wantPlayRef = useRef(false);
  const lastKnownGoodTimeRef = useRef(0);
  const rebufferPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- tick loop (minute based) ---
  const tickLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsSinceLastTickRef = useRef<number>(0);
  const pendingToSendRef = useRef<number>(0);
  const tickInFlightRef = useRef<boolean>(false);
  const lastWallClockRef = useRef<number | null>(null);
  const isActivePlayRef = useRef<boolean>(false);

  // --- quality ---
  const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([{ label: "Auto", height: "auto" }]);
  const qualityOptionsRef = useRef<QualityOption[]>([{ label: "Auto", height: "auto" }]);
  const qualitySetRef = useRef<QualityHeight>("auto");

  // --- retry ---
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ segment-fail watchdog (prevents “ts never retry” by forcing reload+resume)
  const segFailCountRef = useRef(0);
  const segFailCooldownRef = useRef<number>(0);
  const segFailPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // keep state -> ref (so videojs menu always reads latest options)
  useEffect(() => {
    qualityOptionsRef.current = qualityOptions;
  }, [qualityOptions]);

  // ---------------- helpers ----------------
  const formatRemaining = (secs: number | null) => {
    if (secs === null || secs < 0) return "—";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getBufferedAhead = (v: HTMLVideoElement) => {
    try {
      const ct = v.currentTime || 0;
      const b = v.buffered;
      if (!b || b.length === 0) return 0;

      for (let i = 0; i < b.length; i++) {
        const start = b.start(i);
        const end = b.end(i);
        if (ct >= start && ct <= end) return Math.max(0, end - ct);
      }

      const end = b.end(b.length - 1);
      return Math.max(0, end - ct);
    } catch {
      return 0;
    }
  };

  const waitUntilBuffered = async (targetSeconds: number) => {
    const v = techVideoRef.current || videoDomRef.current;
    if (!v) return false;

    return new Promise<boolean>((resolve) => {
      const start = Date.now();
      const MAX_WAIT_MS = 45000;

      if (rebufferPollRef.current) clearInterval(rebufferPollRef.current);
      rebufferPollRef.current = setInterval(() => {
        const buf = getBufferedAhead(v);

        const rem = remainingRef.current;
        if (!wantPlayRef.current || (typeof rem === "number" && rem <= 0)) {
          clearInterval(rebufferPollRef.current!);
          rebufferPollRef.current = null;
          resolve(false);
          return;
        }

        if (buf >= targetSeconds) {
          clearInterval(rebufferPollRef.current!);
          rebufferPollRef.current = null;
          resolve(true);
          return;
        }

        if (Date.now() - start > MAX_WAIT_MS) {
          clearInterval(rebufferPollRef.current!);
          rebufferPollRef.current = null;
          resolve(false);
        }
      }, 250);
    });
  };

  // ---------------- Keyboard controls ----------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = playerRef.current as any;
      if (!p) return;

      // ❌ ignore typing inside inputs / textareas / modals
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const ct = safeNum(p.currentTime?.());
      const vol = safeNum(p.volume?.());

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          p.paused() ? p.play() : p.pause();
          break;

        case "ArrowLeft":
          e.preventDefault();
          p.currentTime(Math.max(0, ct - (e.shiftKey ? 10 : 5)));
          break;

        case "ArrowRight":
          e.preventDefault();
          p.currentTime(ct + (e.shiftKey ? 10 : 5));
          break;

        case "ArrowUp":
          e.preventDefault();
          p.volume(Math.min(1, vol + 0.05));
          break;

        case "ArrowDown":
          e.preventDefault();
          p.volume(Math.max(0, vol - 0.05));
          break;

        case "m":
        case "M":
          e.preventDefault();
          p.muted(!p.muted());
          break;

        case "f":
        case "F":
          e.preventDefault();
          p.isFullscreen() ? p.exitFullscreen() : p.requestFullscreen();
          break;

        // 🔢 Quality shortcuts
        case "1":
          qualitySetRef.current = "auto";
          applyQuality("auto");
          break;
        case "2":
          qualitySetRef.current = 240;
          applyQuality(240);
          break;
        case "3":
          qualitySetRef.current = 360;
          applyQuality(360);
          break;
        case "4":
          qualitySetRef.current = 480;
          applyQuality(480);
          break;

        // ⏩ Playback speed
        case ".":
          p.playbackRate(Math.min(2, p.playbackRate() + 0.25));
          break;
        case ",":
          p.playbackRate(Math.max(0.25, p.playbackRate() - 0.25));
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ rebuffer flow (auto-resume; NEVER requires manual play)
  const startRebufferFlow = useCallback(async (target: number) => {
    const p = playerRef.current as any;
    const v = techVideoRef.current || videoDomRef.current;
    if (!v || !p) return;

    if (rebufferingRef.current) return;

    const rem = remainingRef.current;
    if (typeof rem === "number" && rem <= 0) return;

    // If user paused, don't interfere
    if (p.paused()) return;

    rebufferingRef.current = true;
    setBuffering(true);

    lastKnownGoodTimeRef.current = safeNum(p.currentTime?.());

    // pause to build buffer (then auto resume)
    try {
      p.pause();
    } catch {}

    await waitUntilBuffered(target);

    setBuffering(false);
    rebufferingRef.current = false;

    // restore time and continue
    try {
      p.currentTime(lastKnownGoodTimeRef.current || p.currentTime());
    } catch {}

    // ✅ auto-play (no manual play needed)
    if (wantPlayRef.current) {
      Promise.resolve((p.play() as any) ?? undefined).catch(() => {});
    }
  }, []);

  // ---------------- Fetch meta ----------------
  useEffect(() => {
    if (!videoId) return;
    let mounted = true;

    setLoading(true);
    setErr("");
    setMeta(null);
    setHlsUrl(null);

    axios
      .get(`${API_BASE}/videos/${videoId}`)
      .then((res) => {
        if (!mounted) return;
        const d = res.data || {};

        const masterRel = toRelative(d.master_url);
        const masterAbs = rewriteToPlayerDomain(masterRel || "");

        setMeta({
          ...d,
          master_url: masterAbs,
          thumbnail: rewriteToPlayerDomain(toRelative(d.thumbnail) || ""),
        });
        setHlsUrl(addBuster(masterAbs));
      })
      .catch((e) => setErr(e?.response?.data?.message || e.message || "Failed to load video"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [videoId]);

  // ---------------- Remaining bootstrap ----------------
  useEffect(() => {
    const vId = Number(id);
    if (!vId) return;

    (async () => {
      try {
        const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${vId}/remaining_pack`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        });
        const data = await res.json();

        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          window.location.href = "/";
          return;
        }
        if (!res.ok) throw new Error(data?.error || "remaining failed");

        const rem = typeof data?.remaining_seconds === "number" ? data.remaining_seconds : null;
        setRemainingSecs(rem);
      } catch {
        // keep null
      }
      ensureMinuteTickLoop();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRemainingOnce = async () => {
    try {
      const vId = Number(id);
      if (!vId) return;
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${vId}/remaining_pack`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });
      const data = await res.json();
      if (res.status === 200 && typeof data?.remaining_seconds === "number") {
        setRemainingSecs(data.remaining_seconds);
      }
    } catch {}
  };

  async function postTickOnce(videoNumericId: number, secondsPlayed: number): Promise<boolean> {
    if (secondsPlayed < 60 || tickInFlightRef.current) return true;
    tickInFlightRef.current = true;
    try {
      const res = await fetch(`${defaultConfig.BASE_API_URL}/videos/${videoNumericId}/tick_pack`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: JSON.stringify({
          played_seconds: Math.min(Math.floor(secondsPlayed / 60) * 60, 70),
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        // ✅ ONLY stop on real time-over (403)
        if (res.status === 403) {
          playerRef.current?.pause();
          setRemainingSecs(0);
          return false;
        }
        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          window.location.href = "/";
        }
        // ✅ tick errors must NOT affect playback
        return true;
      }

      if (typeof data?.remaining_seconds === "number") {
        setRemainingSecs(data.remaining_seconds);

        // ✅ ONLY pause when truly time over
        if (data.remaining_seconds <= 0) {
          playerRef.current?.pause();
        }
      }

      return true;
    } catch {
      // ✅ tick failures must NOT affect playback
      return true;
    } finally {
      tickInFlightRef.current = false;
    }
  }

  async function flushWholeMinutes(videoNumericId: number, totalSeconds: number) {
    let toSend = Math.floor(totalSeconds / 60) * 60;
    while (toSend >= 60) {
      const chunk = Math.min(toSend, 60);
      const ok = await postTickOnce(videoNumericId, chunk);
      if (!ok) return false;
      toSend -= chunk;
    }
    return true;
  }

  function ensureMinuteTickLoop() {
    if (tickLoopRef.current) return;

    lastWallClockRef.current = Date.now();
    isActivePlayRef.current =
      !!(techVideoRef.current || videoDomRef.current) &&
      !(techVideoRef.current || videoDomRef.current)!.paused &&
      !(typeof remainingRef.current === "number" && remainingRef.current <= 0);

    tickLoopRef.current = setInterval(() => {
      const rem = remainingRef.current;
      if (typeof rem === "number" && rem <= 0) {
        playerRef.current?.pause();
        isActivePlayRef.current = false;
        return;
      }

      const now = Date.now();
      const dt = lastWallClockRef.current ? Math.max(0, (now - lastWallClockRef.current) / 1000) : 1;
      lastWallClockRef.current = now;

      if (isActivePlayRef.current) {
        secondsSinceLastTickRef.current += dt;

        if (secondsSinceLastTickRef.current >= 60) {
          const vId = Number(id);
          if (vId) {
            const total = secondsSinceLastTickRef.current + pendingToSendRef.current;
            const whole = Math.floor(total / 60) * 60;

            // ✅ do NOT block playback; tick in background
            void (async () => {
              const ok = await flushWholeMinutes(vId, whole);
              if (ok) {
                const leftover = total - whole;
                pendingToSendRef.current = leftover;
                secondsSinceLastTickRef.current = 0;
              }
            })();
          }
        }
      }
    }, 1000);

    const onVis = async () => {
      const vId = Number(id);
      if (document.hidden) {
        isActivePlayRef.current = false;
        if (vId) {
          const total = secondsSinceLastTickRef.current + pendingToSendRef.current;
          const whole = Math.floor(total / 60) * 60;
          if (whole >= 60) await flushWholeMinutes(vId, whole);
          const leftover = total - whole;
          secondsSinceLastTickRef.current = 0;
          pendingToSendRef.current = leftover;
        }
      } else {
        lastWallClockRef.current = Date.now();
        const v = techVideoRef.current || videoDomRef.current;
        const rem = remainingRef.current;
        if (v && !v.paused && !(typeof rem === "number" && rem <= 0)) {
          isActivePlayRef.current = true;
        }
      }
    };

    document.addEventListener("visibilitychange", onVis);
  }

  // ---------------- time-over report ----------------
  useEffect(() => {
    if (typeof remainingSecs === "number" && remainingSecs <= 0) reportTimeOver();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSecs]);

  const reportTimeOver = useCallback(async () => {
    if (timeOverReportedRef.current) return;
    timeOverReportedRef.current = true;
    try {
      await fetch(`${defaultConfig.BASE_API_URL}/videos/${id}/time-over_pack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });
    } catch {}
  }, [id]);

  // ---------------- VHS quality helpers ----------------
  const getVhsRepresentations = () => {
    const p = playerRef.current as any;
    const tech = p?.tech?.(true);
    const vhs = tech?.vhs;
    const reps = typeof vhs?.representations === "function" ? vhs.representations() : [];
    return Array.isArray(reps) ? reps : [];
  };

  // ✅ applyQuality MUST NOT pause; MUST keep playing
  const applyQuality = (height: QualityHeight) => {
    const p = playerRef.current as any;
    if (!p) return;

    const wasPlaying = !p.paused();
    const t = safeNum(lastKnownGoodTimeRef.current || (typeof p.currentTime === "function" ? p.currentTime() : 0));

    const reps = getVhsRepresentations();

    if (height === "auto") {
      reps.forEach((r: any) => {
        try {
          r.enabled(true);
        } catch {}
      });
    } else {
      reps.forEach((r: any) => {
        const h = r?.height;
        try {
          r.enabled(h === height);
        } catch {}
      });
    }

    // keep time
    try {
      p.currentTime(t);
    } catch {}

    // ✅ keep playing automatically
    if (wasPlaying || wantPlayRef.current) {
      setTimeout(() => {
        Promise.resolve((p.play() as any) ?? undefined).catch(() => {});
      }, 0);
    }
  };

  const buildQualityOptionsFromMaster = () => {
    const reps = getVhsRepresentations();
    const heights = reps
      .map((r: any) => (typeof r?.height === "number" ? r.height : null))
      .filter((x: any) => typeof x === "number") as number[];

    const uniq = Array.from(new Set(heights)).sort((a, b) => a - b);

    const opts: QualityOption[] = [{ label: "Auto", height: "auto" }, ...uniq.map((h) => ({ label: `${h}p`, height: h }))];

    // if VHS not ready yet, keep fallback list
    if (opts.length > 1) setQualityOptions(opts);
  };

  // ---------------- Retry (UNLIMITED, NEVER jump to start, NEVER require manual play) ----------------
  const scheduleRetryReload = (_why: string) => {
    const p = playerRef.current as any;
    if (!p || !hlsUrl) return;

    const rem = remainingRef.current;
    if (typeof rem === "number" && rem <= 0) return; // real time-over, don't loop

    // if user paused intentionally, don't fight them
    if (!wantPlayRef.current && p.paused()) return;

    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

    const wasPlaying = wantPlayRef.current || !p.paused();
    const t = safeNum(
      // prefer last known good (updates during timeupdate)
      lastKnownGoodTimeRef.current ||
        (typeof p.currentTime === "function" ? p.currentTime() : 0)
    );

    retryCountRef.current += 1;
    const backoffMs = Math.min(15000, 700 * retryCountRef.current); // unlimited retries, capped delay

    retryTimerRef.current = setTimeout(() => {
      try {
        const src = rewriteToPlayerDomain(addBuster(hlsUrl));
        // IMPORTANT: do not dispose the player; just reset src
        p.src({ src, type: "application/x-mpegURL" });
      } catch {}

      // ✅ wait for metadata before seeking back, so it won't snap to 0
      try {
        p.one?.("loadedmetadata", () => {
          try {
            p.currentTime(t);
          } catch {}
          applyQuality(qualitySetRef.current);

          if (wasPlaying) {
            Promise.resolve((p.play() as any) ?? undefined).catch(() => {});
          }
        });
      } catch {
        // fallback
        setTimeout(() => {
          try {
            p.currentTime(t);
          } catch {}
          applyQuality(qualitySetRef.current);
          if (wasPlaying) Promise.resolve((p.play() as any) ?? undefined).catch(() => {});
        }, 350);
      }

      // small UX signal
      // console.debug("[retry]", why, "t=", t, "backoff=", backoffMs);
    }, backoffMs);
  };

  // ✅ retry on browser network online/offline (helps “network off 2 times”)
  useEffect(() => {
    const onOffline = () => {
      setBuffering(true);
    };
    const onOnline = () => {
      setBuffering(false);
      // force reload and continue from same point
      if (wantPlayRef.current) scheduleRetryReload("online");
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlsUrl]);

  // ---------------- register Quality components ONCE ----------------
  const QUALITY_ITEM = "QualityMenuItem";
  const QUALITY_BTN = "QualityMenuButton";

  useEffect(() => {
    const MenuButton = videojs.getComponent("MenuButton") as any;
    const MenuItem = videojs.getComponent("MenuItem") as any;

    if (!videojs.getComponent(QUALITY_ITEM)) {
      class QualityMenuItem extends MenuItem {
        private opt: QualityOption;
        constructor(playerX: any, optionsX: any) {
          super(playerX, optionsX);
          this.opt = optionsX.opt as QualityOption;
          this.on("click", () => {
            qualitySetRef.current = this.opt.height;

            // mark user intent to continue playing
            wantPlayRef.current = true;

            applyQuality(this.opt.height);

            // force menu refresh selected states
            try {
              const btn = (playerRef.current as any)?.controlBar?.getChild?.(QUALITY_BTN);
              if (btn && typeof btn.update === "function") btn.update();
            } catch {}

            // ✅ keep playing (no manual play)
            setTimeout(() => {
              try {
                const p = playerRef.current as any;
                if (p) Promise.resolve((p.play() as any) ?? undefined).catch(() => {});
              } catch {}
            }, 0);
          });
        }
      }
      videojs.registerComponent(QUALITY_ITEM, QualityMenuItem as any);
    }

    if (!videojs.getComponent(QUALITY_BTN)) {
      class QualityMenuButton extends MenuButton {
        constructor(playerX: any, optionsX: any) {
          super(playerX, optionsX);
          this.controlText("Quality");

          // ✅ icon like other controls (center aligned)
          this.addClass("vjs-quality-button");
          this.addClass("vjs-icon-cog"); // built-in icon
        }

        // ✅ build menu items each time opened, from ref (always latest)
        createItems() {
          const opts = qualityOptionsRef.current || [{ label: "Auto", height: "auto" as const }];
          return opts.map((opt) => {
            return new (videojs.getComponent(QUALITY_ITEM) as any)(this.player(), {
              label: opt.label,
              selectable: true,
              selected: qualitySetRef.current === opt.height,
              opt,
            });
          });
        }
      }
      videojs.registerComponent(QUALITY_BTN, QualityMenuButton as any);
    }
  }, []);

  // ---------------- Init Video.js ----------------
  useEffect(() => {
    if (!hlsUrl) return;
    if (!videoDomRef.current) return;

    // destroy old
    if (playerRef.current) {
      try {
        playerRef.current.dispose();
      } catch {}
      playerRef.current = null;
    }

    retryCountRef.current = 0;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    // clear old segment watchdog
    try {
      if (segFailPollRef.current) clearInterval(segFailPollRef.current);
      segFailPollRef.current = null;
    } catch {}

    const el = videoDomRef.current;

    const player = videojs(el, {
      controls: true,
      preload: "auto",
      fluid: true,
      responsive: true,
      playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      controlBar: {
        pictureInPictureToggle: false,
      },
      html5: {
        vhs: {
          overrideNative: true,

          // ✅ rewrite all requests (manifest + segments + keys)
          beforeRequest: (options: any) => {
            if (options?.uri) options.uri = rewriteToPlayerDomain(options.uri);

            // ✅ shorter timeouts => faster retry loop
            options.timeout = options?.timeout ?? 15000;

            // ✅ allow vhs to retry naturally
            return options;
          },

          // playlist retries (manifest level)
          maxPlaylistRetries: 999999, // effectively unlimited
          playlistExclusionDuration: 2, // don't exclude too long
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    });

    playerRef.current = player;

    // IMPORTANT: attach xhr hooks early (VHS doc: xhr-hooks-ready) :contentReference[oaicite:0]{index=0}
    player.on("xhr-hooks-ready", () => {
      try {
        const tech = (player as any).tech(true);
        const vhs = tech?.vhs;
        const xhr = vhs?.xhr;
        if (!xhr?.onRequest || !xhr?.onResponse) return;

        // request hook
        const reqHook = (options: any) => {
          if (options?.uri) options.uri = rewriteToPlayerDomain(options.uri);
          options.timeout = options?.timeout ?? 15000;
          return options;
        };

        // response hook: if a .ts segment fails, force our own reload+resume (unlimited)
        const resHook = (request: any, error: any, response: any) => {
          const uri = request?.uri || request?.url || "";
          const isSegment = /\.ts(\?|$)/i.test(uri) || /\.m4s(\?|$)/i.test(uri);
          const isManifest = /\.m3u8(\?|$)/i.test(uri);

          // only care while user is trying to play
          if (!wantPlayRef.current) return;

          const status = safeNum(response?.statusCode ?? response?.status);
          const failed =
            !!error ||
            status === 0 ||
            status === 404 ||
            status === 408 ||
            status === 429 ||
            (status >= 500 && status <= 599);

          if (failed && (isSegment || isManifest)) {
            // small cooldown to avoid spamming reload 10 times in 1 second
            const now = Date.now();
            if (now < segFailCooldownRef.current) return;
            segFailCooldownRef.current = now + 900; // 0.9s cooldown

            segFailCountRef.current += 1;

            // keep a very fresh seek point
            try {
              lastKnownGoodTimeRef.current = safeNum((player as any).currentTime?.());
            } catch {}

            scheduleRetryReload(isSegment ? "segment-fail" : "manifest-fail");
          }
        };

        xhr.onRequest(reqHook);
        xhr.onResponse(resHook);

        // cleanup on dispose
        (player as any)._vhsReqHook = reqHook;
        (player as any)._vhsResHook = resHook;
      } catch {}
    });

    // set source
    player.src({
      src: rewriteToPlayerDomain(hlsUrl),
      type: "application/x-mpegURL",
    });

    // ✅ add ONLY ONE quality button (remove if already exists)
    player.ready(() => {
      try {
        const cb = (player as any).controlBar;
        if (!cb) return;

        // remove duplicates (if any)
        try {
          const existing = cb.getChild?.(QUALITY_BTN);
          if (existing) cb.removeChild(existing);
        } catch {}

        // insert near right side, before fullscreen
        const children = cb.children?.() || [];
        const fsIndex = children.findIndex((c: any) => c?.name?.() === "FullscreenToggle");
        const insertAt = fsIndex > 0 ? fsIndex : children.length - 1;

        cb.addChild(QUALITY_BTN, {}, insertAt);
      } catch {}
    });

    // build qualities when playlists loaded
    const onLoadedMeta = () => {
      buildQualityOptionsFromMaster();
      applyQuality(qualitySetRef.current);
    };

    player.on("loadedmetadata", onLoadedMeta);
    player.on("loadeddata", onLoadedMeta);

    player.on("play", () => {
      const rem = remainingRef.current;
      if (typeof rem === "number" && rem <= 0) {
        player.pause();
        return;
      }
      if (rem == null) void fetchRemainingOnce();

      wantPlayRef.current = true;
      isActivePlayRef.current = true;
      lastWallClockRef.current = Date.now();

      setBuffering(true);
      void (async () => {
        await waitUntilBuffered(TARGET_FIRST_START);
        setBuffering(false);
      })();

      ensureMinuteTickLoop();
    });

    player.on("pause", () => {
      // user pause
      wantPlayRef.current = false;
      isActivePlayRef.current = false;
      setBuffering(false);

      // flush minutes on pause (no playback effects)
      const vId = Number(id);
      if (vId) {
        const total = secondsSinceLastTickRef.current + pendingToSendRef.current;
        const whole = Math.floor(total / 60) * 60;
        if (whole >= 60) void flushWholeMinutes(vId, whole);
        const leftover = total - whole;
        secondsSinceLastTickRef.current = 0;
        pendingToSendRef.current = leftover;
      }
    });

    player.on("timeupdate", () => {
      if (!player.paused()) {
        lastKnownGoodTimeRef.current = safeNum((player as any).currentTime?.());
      }
    });

    // ✅ seek should NEVER end in paused state if user was playing
    player.on("seeking", () => {
      wantPlayRef.current = true;
      setBuffering(true);
    });

    player.on("seeked", () => {
      setBuffering(false);
      // ✅ auto-resume after seek
      if (wantPlayRef.current) {
        Promise.resolve(((player as any).play?.() as any) ?? undefined).catch(() => {});
      }
    });

    player.on("waiting", () => {
      const v = (player as any).tech(true)?.el?.() as HTMLVideoElement | null;
      if (!v) return;

      // only rebuffer if actually trying to play
      if (wantPlayRef.current && !player.paused() && v.readyState < 3) {
        startRebufferFlow(TARGET_REBUFFER);
      }
    });

    player.on("stalled", () => {
      if (wantPlayRef.current) startRebufferFlow(TARGET_REBUFFER);
    });

    // ✅ IMPORTANT: player error event is not always fired for segment fails,
    // but keep it as a backup.
    player.on("error", () => {
      // keep last time and retry forever
      scheduleRetryReload("player-error");
    });

    // ✅ store tech el in separate ref
    const techEl = (player as any).tech(true)?.el?.() as HTMLVideoElement | null;
    if (techEl) techVideoRef.current = techEl;

    // ✅ watchdog: if VHS stops progressing (ts fail “never retry”), force reload+resume
    segFailPollRef.current = setInterval(() => {
      const p = playerRef.current as any;
      if (!p) return;

      const rem = remainingRef.current;
      if (typeof rem === "number" && rem <= 0) return;

      if (!wantPlayRef.current) return;

      // If buffering/waiting too long, force retry
      const isPaused = !!p.paused?.();
      const v = techVideoRef.current || videoDomRef.current;
      const buf = v ? getBufferedAhead(v) : 0;

      // if play intent but stuck with tiny buffer, retry
      if (!isPaused && buf < 0.3) {
        // if stuck for multiple checks, retry
        segFailCountRef.current += 1;
        if (segFailCountRef.current % 3 === 0) {
          scheduleRetryReload("watchdog-stuck");
        }
      } else {
        // reset when healthy
        segFailCountRef.current = 0;
      }
    }, 1500);

    return () => {
      try {
        if (rebufferPollRef.current) clearInterval(rebufferPollRef.current);
        rebufferPollRef.current = null;
      } catch {}

      try {
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      } catch {}

      try {
        if (segFailPollRef.current) clearInterval(segFailPollRef.current);
        segFailPollRef.current = null;
      } catch {}

      // remove xhr hooks if we attached them
      try {
        const p: any = player;
        const tech = p?.tech?.(true);
        const xhr = tech?.vhs?.xhr;
        if (xhr?.offRequest && p._vhsReqHook) xhr.offRequest(p._vhsReqHook);
        if (xhr?.offResponse && p._vhsResHook) xhr.offResponse(p._vhsResHook);
      } catch {}

      try {
        player.dispose();
      } catch {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlsUrl, startRebufferFlow]);

  // refresh menu selected states when options change
  useEffect(() => {
    const p = playerRef.current as any;
    if (!p) return;
    try {
      const btn = p?.controlBar?.getChild?.(QUALITY_BTN);
      if (btn && typeof btn.update === "function") btn.update();
    } catch {}
  }, [qualityOptions]);

  // ---------------- Watermark ----------------
  useEffect(() => {
    if (!wrapperRef.current) return;

    let wm: HTMLDivElement | null = null;
    let posInterval: ReturnType<typeof setInterval> | null = null;

    const addWM = () => {
      if (!wrapperRef.current) return;

      wrapperRef.current.querySelectorAll(".watermark").forEach((n) => n.remove());
      const watermark = document.createElement("div");
      watermark.className = "watermark";
      watermark.style.cssText = `
        position:absolute;color:rgba(255,255,255,.7);padding:5px;font-size:10px;pointer-events:none;user-select:none;
        text-shadow:1px 1px 2px rgba(0,0,0,.7);z-index:2147483647;font-family:Arial,sans-serif;white-space:nowrap;`;
      const userId = localStorage.getItem("evrest_id") || "unknown";
      const timestamp = new Date().toISOString();
      const randomId = Math.random().toString(36).slice(2, 10);
      watermark.textContent = `User: ${userId} • ID: ${randomId} • ${timestamp.substring(0, 10)}`;
      wrapperRef.current.appendChild(watermark);
      wm = watermark;

      const updatePos = () => {
        if (!wrapperRef.current || !wm) return;
        const wr = wrapperRef.current.getBoundingClientRect();

        const wmW = 220,
          wmH = 30;
        const maxX = Math.max(0, wr.width - wmW);
        const maxY = Math.max(0, wr.height - wmH);

        const rx = Math.floor(Math.random() * maxX);
        const ry = Math.floor(Math.random() * maxY);

        wm.style.left = `${rx}px`;
        wm.style.top = `${ry}px`;
        wm.style.opacity = (Math.random() * 0.3 + 0.7).toFixed(2);
      };

      setTimeout(updatePos, 100);
      posInterval = setInterval(updatePos, 8000 + Math.random() * 4000);
    };

    addWM();

    return () => {
      try {
        if (posInterval) clearInterval(posInterval);
      } catch {}
      try {
        wm?.remove();
      } catch {}
    };
  }, [hlsUrl]);

  // ---------------- Ensure fallback qualities show 240/360/480 ----------------
  useEffect(() => {
    // fallback list (real list will override when VHS is ready)
    setQualityOptions([
      { label: "Auto", height: "auto" },
      { label: "240p", height: 240 },
      { label: "360p", height: 360 },
      { label: "480p", height: 480 },
    ]);
  }, []);

  // ---------------- UI ----------------
  const bufferingLabel = useMemo(() => {
    const t = rebufferingRef.current ? TARGET_REBUFFER : TARGET_FIRST_START;
    return `Buffering… building ${t}s`;
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <style>{`
        .video-js .vjs-quality-button { width: 3em; }
        .video-js .vjs-quality-button .vjs-icon-placeholder:before { line-height: 2.2em; }
      `}</style>

      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = `/single-pack/${class_id}`)}
            className="inline-flex items-center px-4 py-2 bg-white text-purple-700 rounded-lg shadow-sm hover:bg-purple-50 transition-all duration-300 border border-purple-100 font-medium"
          >
            <span className="mr-2">←</span>
            Back to Class!.
          </button>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 backdrop-blur-sm bg-opacity-90">
            <div className="p-6 md:p-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                {meta?.title || "Secure Video Player"}
              </h2>

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-purple-200 rounded-full animate-pulse" />
                    <div className="absolute top-0 left-0 w-full h-full border-t-8 border-purple-600 rounded-full animate-spin" />
                  </div>
                  <p className="mt-6 text-lg text-purple-700 font-medium">Preparing your video...</p>
                </div>
              )}

              {err && (
                <div className="mt-6 p-6 bg-red-50 rounded-xl border border-red-100 text-center">
                  <p className="text-red-600 font-medium text-lg">{err}</p>
                </div>
              )}

              {typeof remainingSecs === "number" && remainingSecs <= 0 && (
                <div className="mt-6 p-6 bg-black/80 rounded-xl text-center text-white">
                  <div className="text-lg font-semibold">Time’s up</div>
                  <div className="text-sm opacity-90 mt-1">Your viewing time for this video has ended.</div>
                </div>
              )}

              {hlsUrl && !loading && !err && (
                <div className="mt-6 relative">
                  {typeof remainingSecs === "number" && (
                    <div className="absolute right-3 top-3 z-20">
                      <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-xs font-semibold border border-white/10">
                        Remaining: {formatRemaining(remainingSecs)}
                      </div>
                    </div>
                  )}
   
                 {buffering && remainingSecs == 0  &&(
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div className="bg-black/70 px-4 py-2 rounded-md text-white text-sm">{bufferingLabel}</div>
                    </div>
                  )}

                  <div ref={wrapperRef} className="relative rounded-xl overflow-hidden shadow-2xl">
                    <video
                      ref={videoDomRef}
                      className="video-js vjs-big-play-centered vjs-theme-sea w-full"
                      playsInline
                      crossOrigin="anonymous"
                      controls
                      preload="auto"
                      poster={meta?.thumbnail || undefined}
                    />
                  </div>
                </div>
              )}

              {meta?.status && meta?.status !== "ready" && (
                <div className="mt-4 text-sm text-gray-600">
                  Your video is still processing. The player will work when status becomes{" "}
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
