"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Headphones, Play, Pause } from "lucide-react";
import { buildVoiceScript } from "@/lib/voice-script";
import type { MorningBriefData } from "@/db/schema/morning-briefs";

// ── Types ────────────────────────────────────────────────────────────────────

type PlayStatus = "idle" | "playing" | "paused";
type Speed = 1 | 1.5 | 2;

const SPEEDS: Speed[] = [1, 1.5, 2];

// ── Waveform visualizer ──────────────────────────────────────────────────────

/**
 * Five animated bars that bounce while audio is playing.
 * Uses the `voice-wave-bar` keyframe defined in globals.css.
 */
function WaveformBars() {
  return (
    <div className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
      {([10, 6, 14, 8, 12] as const).map((baseH, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-blue-400/80 inline-block"
          style={{
            height: `${baseH}px`,
            animation: `voice-wave-bar ${0.65 + i * 0.06}s ease-in-out ${i * 110}ms infinite`,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

// ── Player ───────────────────────────────────────────────────────────────────

interface VoiceBriefingPlayerProps {
  data: MorningBriefData;
}

/**
 * Embedded mini-player for the Morning Brief card.
 * Uses the Web Speech API (SpeechSynthesis) — zero external dependencies for MVP.
 *
 * ── Swapping in a real TTS service ──────────────────────────────────────────
 * 1. Create POST /api/portal/voice-briefing that accepts { script } and returns
 *    { audioUrl } (generated via ElevenLabs/OpenAI TTS, stored in Vercel Blob).
 * 2. Replace the `speak()` call below with:
 *      const { audioUrl } = await fetch('/api/portal/voice-briefing', {...}).json();
 *      audioRef.current = new Audio(audioUrl);
 *      audioRef.current.playbackRate = speed;
 *      audioRef.current.play();
 * 3. Use audioRef.current.ontimeupdate for progress instead of onboundary.
 * The script itself still comes from data.voiceScript ?? buildVoiceScript(data).
 * ────────────────────────────────────────────────────────────────────────────
 */
export function VoiceBriefingPlayer({ data }: VoiceBriefingPlayerProps) {
  const [status, setStatus] = useState<PlayStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);
  const [supported, setSupported] = useState(true);

  const scriptRef = useRef<string>("");

  // Check support and build script once on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    // Prefer server-generated script (conversational, Claude-written);
    // fall back to deterministic builder if not cached yet.
    scriptRef.current = data.voiceScript ?? buildVoiceScript(data);
  }, [data]);

  // Cancel speech cleanly on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Chrome bug: SpeechSynthesis silently stops after ~15 s when tab is in background.
  // Periodic pause+resume keeps it alive without audible glitching.
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10_000);
    return () => clearInterval(id);
  }, [status]);

  const startSpeech = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setProgress(0);

    const script = scriptRef.current;
    const utter = new SpeechSynthesisUtterance(script);
    utter.rate = speed;
    utter.lang = "en-US";

    utter.onboundary = (e) => {
      if (e.name === "word") {
        setProgress(Math.min(e.charIndex / script.length, 1));
      }
    };

    utter.onend = () => {
      setStatus("idle");
      setProgress(0);
    };

    utter.onerror = () => {
      setStatus("idle");
      setProgress(0);
    };

    window.speechSynthesis.speak(utter);
    setStatus("playing");
  }, [speed]);

  function handleToggle() {
    if (!("speechSynthesis" in window)) return;

    if (status === "idle") {
      startSpeech();
    } else if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else {
      // paused → resume
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  }

  function handleSpeedChange(s: Speed) {
    // Speed can only be set before or at start of playback; restart if already playing
    if (status === "playing") {
      window.speechSynthesis.cancel();
      setStatus("idle");
      setProgress(0);
    }
    setSpeed(s);
  }

  // Graceful fallback for unsupported browsers
  if (!supported) {
    return (
      <div className="border-t border-blue-500/20 pt-3 mt-1">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-blue-400/40" aria-hidden="true" />
          <p className="text-xs text-blue-300/40">
            Voice briefings require a browser that supports Web Speech API.
          </p>
        </div>
      </div>
    );
  }

  const isPlaying = status === "playing";
  const isActive = status !== "idle";

  return (
    <div className="border-t border-blue-500/20 pt-4 mt-1">
      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Label + live waveform */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Headphones
            className={`w-4 h-4 flex-shrink-0 transition-colors ${isPlaying ? "text-blue-300" : "text-blue-400/70"}`}
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-blue-200/80 truncate">
            {isPlaying
              ? "Playing your briefing..."
              : status === "paused"
              ? "Paused"
              : "Listen to your briefing"}
          </span>
          {isPlaying && <WaveformBars />}
        </div>

        {/* Speed selector */}
        <div
          className="flex items-center gap-0.5"
          role="group"
          aria-label="Playback speed"
        >
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`text-[11px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                speed === s
                  ? "bg-blue-500/30 text-blue-200"
                  : "text-blue-300/50 hover:text-blue-300"
              }`}
              aria-label={`${s}x speed`}
              aria-pressed={speed === s}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Play / Pause button */}
        <button
          onClick={handleToggle}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
            isActive
              ? "bg-blue-500/30 border-blue-400/50 hover:bg-blue-500/40"
              : "bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30"
          } active:scale-95`}
          aria-label={isPlaying ? "Pause briefing" : "Play briefing"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-blue-200" aria-hidden="true" />
          ) : (
            <Play className="w-3.5 h-3.5 text-blue-200 ml-0.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="mt-2.5 h-1 bg-blue-500/20 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Briefing playback progress"
      >
        <div
          className="h-full bg-blue-400/60 rounded-full transition-[width] duration-300 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
