"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X, ArrowRight } from "lucide-react"

export const TOUR_KEY = "cws-portal-tour-v1"

interface TourStep {
  tourId: string
  emoji: string
  title: string
  description: string
}

const STEPS: TourStep[] = [
  {
    tourId: "tour-dashboard",
    emoji: "🏠",
    title: "Your Dashboard",
    description:
      "Your command center. See your Growth Score, weekly activity, and everything happening with your website — all at a glance.",
  },
  {
    tourId: "tour-messages",
    emoji: "💬",
    title: "Messages",
    description:
      "Your direct line to the CWS team. Ask questions, request changes, and track every conversation in one threaded inbox.",
  },
  {
    tourId: "tour-analytics",
    emoji: "📊",
    title: "Analytics",
    description:
      "Deep-dive into traffic, lead tracking, and growth trends. Know exactly where your visitors come from and what's converting.",
  },
  {
    tourId: "tour-reports",
    emoji: "📄",
    title: "Reports",
    description:
      "Monthly performance reports from your CWS team, delivered straight to your portal with actionable insights and recommendations.",
  },
  {
    tourId: "tour-settings",
    emoji: "⚙️",
    title: "Settings",
    description:
      "Manage billing, team members, notification preferences, and white-label branding — all from one place.",
  },
]

const SPOTLIGHT_PADDING = 8

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

function getRect(tourId: string): SpotlightRect | null {
  const el = document.querySelector(`[data-tour="${tourId}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
}

export function PortalTour() {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<SpotlightRect | null>(null)
  // Animate tooltip entrance per step
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const done = localStorage.getItem(TOUR_KEY)
    if (!done) {
      const t = setTimeout(() => setActive(true), 900)
      return () => clearTimeout(t)
    }
  }, [])

  const refreshRect = useCallback((tourId: string) => {
    const raf = requestAnimationFrame(() => {
      const r = getRect(tourId)
      setRect(r)
      // Fade tooltip in after rect is set
      setTimeout(() => setVisible(true), 40)
    })
    return raf
  }, [])

  useEffect(() => {
    if (!active) return
    setVisible(false)
    const raf = refreshRect(STEPS[step].tourId)
    return () => cancelAnimationFrame(raf)
  }, [active, step, refreshRect])

  useEffect(() => {
    if (!active) return
    const onResize = () => refreshRect(STEPS[step].tourId)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [active, step, refreshRect])

  const dismiss = useCallback((completed: boolean) => {
    localStorage.setItem(TOUR_KEY, completed ? "completed" : "skipped")
    setVisible(false)
    setTimeout(() => setActive(false), 200)
  }, [])

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setVisible(false)
      setTimeout(() => setStep((s) => s + 1), 150)
    } else {
      dismiss(true)
    }
  }, [step, dismiss])

  if (!mounted || !active) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Tooltip positioning: to the right of the sidebar spotlight
  const viewH = typeof window !== "undefined" ? window.innerHeight : 768
  const viewW = typeof window !== "undefined" ? window.innerWidth : 1280

  const spotTop = rect ? rect.top - SPOTLIGHT_PADDING : 0
  const spotLeft = rect ? rect.left - SPOTLIGHT_PADDING : 0
  const spotW = rect ? rect.width + SPOTLIGHT_PADDING * 2 : 0
  const spotH = rect ? rect.height + SPOTLIGHT_PADDING * 2 : 0

  // Tooltip: vertically centered on the spotlight, positioned to its right
  const cardW = 288
  const rawCardLeft = rect ? rect.right + 20 : 260
  const cardLeft = Math.min(rawCardLeft, viewW - cardW - 16)
  const rawCardTop = rect ? rect.top + rect.height / 2 : viewH / 2
  const cardTop = Math.max(16, Math.min(rawCardTop, viewH - 260))

  return createPortal(
    <>
      {/* ── Interaction blocker (below spotlight) ──────────────────── */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9996 }}
        aria-hidden="true"
      />

      {/* ── Spotlight (box-shadow punches hole in overlay) ─────────── */}
      {rect && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 10,
            boxShadow: "0 0 0 9999px rgba(9, 14, 26, 0.80)",
            border: "2px solid rgba(37, 99, 235, 0.85)",
            outline: "3px solid rgba(37, 99, 235, 0.22)",
            outlineOffset: 3,
            zIndex: 9997,
            pointerEvents: "none",
            transition:
              "top 0.38s cubic-bezier(0.4,0,0.2,1), left 0.38s cubic-bezier(0.4,0,0.2,1), width 0.38s cubic-bezier(0.4,0,0.2,1), height 0.38s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      )}

      {/* ── Tooltip card ───────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal
        aria-label={`Tour step ${step + 1} of ${STEPS.length}: ${current.title}`}
        style={{
          position: "fixed",
          top: cardTop,
          left: cardLeft,
          transform: "translateY(-50%)",
          width: cardW,
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transform: `translateY(-50%) translateX(${visible ? 0 : -8}px)`,
          transition: "opacity 0.22s ease, transform 0.22s ease, top 0.38s cubic-bezier(0.4,0,0.2,1), left 0.38s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Card header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0a0e1a 0%, #131b2e 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "20px 20px 16px",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 10 }}>{current.emoji}</div>
              <h3 style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.3 }}>
                {current.title}
              </h3>
            </div>
            <button
              onClick={() => dismiss(false)}
              aria-label="Skip tour"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "none",
                borderRadius: 6,
                padding: "4px 6px",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
              className="hover:bg-white/15 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Card body */}
        <div style={{ background: "#fff", padding: "16px 20px 18px" }}>
          <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
            {current.description}
          </p>

          {/* Step dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  height: 5,
                  borderRadius: 99,
                  backgroundColor: i === step ? "#2563eb" : i < step ? "#93c5fd" : "#e2e8f0",
                  width: i === step ? 22 : 10,
                  transition: "width 0.3s ease, background-color 0.3s ease",
                }}
              />
            ))}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
              {step + 1}/{STEPS.length}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => dismiss(false)}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#94a3b8",
                cursor: "pointer",
                fontWeight: 500,
              }}
              className="hover:border-slate-300 hover:text-slate-500 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={next}
              style={{
                flex: 2,
                background: "#2563eb",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
              className="hover:bg-blue-700 transition-colors"
            >
              {isLast ? "Get started" : "Next"}
              {!isLast && <ArrowRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
