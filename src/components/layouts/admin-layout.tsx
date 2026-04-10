"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"
import { useClerk, useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
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

interface AdminLayoutProps {
  children: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "📊", exact: true },
  { label: "Clients", href: "/admin/clients", icon: "👥" },
  { label: "Task Queue", href: "/admin/queue", icon: "📋" },
  { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
  { label: "Revenue", href: "/admin/revenue", icon: "💰" },
  { label: "FAQ", href: "/admin/faq", icon: "❓" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
]

export function AdminLayout({
  children,
  breadcrumbs,
}: AdminLayoutProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const firstName = user?.firstName ?? ""
  const lastName = user?.lastName ?? ""
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ""
  const userInitials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
        ? `${firstName[0]}${firstName[1] ?? ""}`.toUpperCase()
        : userEmail
          ? userEmail[0].toUpperCase()
          : "AD"

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-800 md:static md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-4 border-b border-slate-700">
            <Link
              href="/admin"
              className="flex items-center gap-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/brand/logo-mark-nav.png"
                  alt="Caliber Web Studio"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <div className="font-bold text-sm text-white leading-tight group-hover:text-slate-200 transition-colors">
                  Caliber Web Studio
                </div>
                <div className="text-[10px] font-semibold text-red-400 uppercase tracking-widest mt-0.5">
                  Admin
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}

            {/* Owner shortcut — view own client portal */}
            <div className="pt-3 mt-3 border-t border-slate-700">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <span className="text-lg">🏢</span>
                My Client Portal
              </Link>
            </div>
          </nav>

          {/* User Menu */}
          <div className="border-t border-slate-700 p-4">
            <DropdownMenu>
              <DropdownTrigger>
                <div className="flex items-center gap-3 cursor-pointer group">
                  <Avatar size="md">
                    <AvatarImage src="/avatar.jpg" alt="Admin avatar" />
                    <AvatarFallback>
                      <span className="text-sm font-bold text-white">{userInitials}</span>
                    </AvatarFallback>
                  </Avatar>
                  {userEmail && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {[firstName, lastName].filter(Boolean).join(" ") || "Admin"}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                    </div>
                  )}
                </div>
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
                  Profile
                </DropdownItem>
                <DropdownItem onClick={() => {}}>
                  Settings
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => signOut({ redirectUrl: '/login' })}>
                  Sign Out
                </DropdownItem>
              </DropdownContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-700 text-white"
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

            {/* Breadcrumbs */}
            <div className="flex-1 mx-4">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <span className="text-slate-500">/</span>
                      )}
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="text-slate-400 hover:text-white"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-white">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Admin Dashboard</div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <NotificationBell
                unreadCount={0}
                onClick={() => {}}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-900">
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
