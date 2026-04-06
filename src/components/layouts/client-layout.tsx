"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/notification-bell"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown-menu"

interface ClientLayoutProps {
  children: React.ReactNode
  orgName?: string
  unreadNotifications?: number
  userInitials?: string
  userEmail?: string
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Pages", href: "/pages", icon: "📄" },
  { label: "Brand Assets", href: "/brand-assets", icon: "🎨" },
  { label: "Messages", href: "/messages", icon: "💬" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
]

const lockedItems = [
  { label: "Analytics", icon: "📈", upgrade: true },
  { label: "Reports", icon: "📋", upgrade: true },
  { label: "Social", icon: "📱", upgrade: true },
]

export function ClientLayout({
  children,
  orgName = "Caliber Web Studio",
  unreadNotifications = 0,
  userInitials = "CL",
  userEmail,
}: ClientLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:static md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="font-bold text-lg text-slate-900 dark:text-slate-50">
              CWS
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Locked Items */}
          <div className="space-y-1 border-t border-slate-200 px-3 py-4 dark:border-slate-800">
            {lockedItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </div>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ))}
            <div className="pt-2">
              <button className="w-full px-3 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Org Name */}
            <div className="flex-1 mx-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {orgName}
              </h2>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <NotificationBell
                unreadCount={unreadNotifications}
                onClick={() => {}}
              />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownTrigger>
                  <Avatar size="sm">
                    <AvatarImage src="/avatar.jpg" alt="User avatar" />
                    <AvatarFallback name={userInitials} />
                  </Avatar>
                </DropdownTrigger>
                <DropdownContent>
                  {userEmail && (
                    <>
                      <div className="px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {userEmail}
                      </div>
                      <DropdownSeparator />
                    </>
                  )}
                  <DropdownItem onClick={() => {}}>
                    Profile Settings
                  </DropdownItem>
                  <DropdownItem onClick={() => {}}>
                    Account
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => {}}>
                    Sign Out
                  </DropdownItem>
                </DropdownContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-6 md:px-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
