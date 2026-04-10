"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
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

interface AdminLayoutProps {
  children: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
  userInitials?: string
  userEmail?: string
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
  userInitials = "AD",
  userEmail,
}: AdminLayoutProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="font-bold text-lg text-white">
              CWS Admin
            </div>
            <div className="text-xs text-slate-400 mt-1">Admin Badge</div>
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
          </nav>

          {/* User Menu */}
          <div className="border-t border-slate-700 p-4">
            <DropdownMenu>
              <DropdownTrigger>
                <Avatar size="md">
                  <AvatarImage src="/avatar.jpg" alt="Admin avatar" />
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
