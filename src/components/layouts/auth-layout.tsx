"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function AuthLayout({
  children,
  title = "Caliber Web Studio",
  description = "Client Portal",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 mb-4">
            <span className="text-white font-bold text-lg">CWS</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-400 mt-2">{description}</p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Secured by Caliber
            <br />
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
