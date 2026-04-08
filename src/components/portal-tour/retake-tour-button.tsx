"use client"

import { useState } from "react"
import { RotateCcw, Check } from "lucide-react"
import { TOUR_KEY } from "./portal-tour"

export function RetakeTourButton() {
  const [done, setDone] = useState(false)

  function handleClick() {
    localStorage.removeItem(TOUR_KEY)
    setDone(true)
    // Reload to trigger the tour on the dashboard
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 800)
  }

  return (
    <button
      onClick={handleClick}
      disabled={done}
      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-green-600 transition-colors"
    >
      {done ? (
        <>
          <Check className="w-4 h-4" />
          Redirecting to dashboard…
        </>
      ) : (
        <>
          <RotateCcw className="w-4 h-4" />
          Take the portal tour again
        </>
      )}
    </button>
  )
}
