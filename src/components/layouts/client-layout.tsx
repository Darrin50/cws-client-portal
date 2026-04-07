"use client"

import React, { useState, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  Home,
  Monitor,
  Palette,
  MessageSquare,
  Settings,
  BarChart2,
  FileBarChart,
  Share2,
  Lock,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Camera,
  Trophy,
  Globe,
  SearchCheck,
} from "lucide-react"
import { MilestoneChecker } from "@/components/milestones/milestone-checker"

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "My Website", href: "/pages", icon: Monitor },
  { label: "My Brand", href: "/brand", icon: Palette },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Milestones", href: "/milestones", icon: Trophy },
  { label: "Competitors", href: "/competitors", icon: Globe },
  { label: "Site Audit", href: "/audit", icon: SearchCheck },
  { label: "Settings", href: "/settings", icon: Settings },
]

const lockedItems = [
  { label: "Analytics", icon: BarChart2, tooltip: "Upgrade your plan to unlock Analytics" },
  { label: "Reports", icon: FileBarChart, tooltip: "Upgrade your plan to unlock Reports" },
  { label: "Social Media", icon: Share2, tooltip: "Upgrade your plan to unlock Social Media" },
]

interface ClientLayoutProps {
  children: React.ReactNode
  unreadNotifications?: number
  userInitials?: string
  userEmail?: string
  userName?: string
}

export function ClientLayout({
  children,
  unreadNotifications = 0,
  userInitials = "DM",
  userEmail = "darrin@business.com",
  userName = "Darrin Mitchell",
}: ClientLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [avatarHovered, setAvatarHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()

  const activeLabel = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  )?.label ?? "Home"

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setProfilePic(ev.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex h-screen bg-[var(--page-bg)]">
      {/* Sidebar — always dark navy regardless of theme */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-[#0a0e1a] md:static md:translate-x-0 transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="CWS"
              width={32}
              height={32}
              className="object-contain flex-shrink-0"
              priority
            />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">Caliber Web Studio</p>
              <p className="text-slate-500 text-[10px] leading-tight">Client Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline pl-[10px] pr-3",
                  isActive
                    ? "bg-white/10 text-white border-l-[3px] border-blue-500 pl-[7px]"
                    : "text-slate-400 hover:bg-white/8 hover:text-white border-l-[3px] border-transparent"
                )}
                style={!isActive ? { paddingLeft: "10px" } : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Locked Items */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5 flex-shrink-0">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-3 mb-3">
            Upgrade to unlock
          </p>
          {lockedItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                title={item.tooltip}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-600 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {item.label}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded-full tracking-wide">
                    PRO
                  </span>
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            )
          })}
        </div>

        {/* User Section with clickable avatar */}
        <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Clickable avatar */}
            <div
              className="relative w-9 h-9 rounded-full flex-shrink-0 cursor-pointer"
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              {profilePic ? (
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/15"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/15">
                  {userInitials}
                </div>
              )}
              {avatarHovered && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
            <button aria-label="Sign out" className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-[var(--header-bg)] border-b border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center h-14 px-6 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-sm">
              <span className="text-slate-400">Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-[var(--text-primary)]">{activeLabel}</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Dark mode toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-slate-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-500" />
                )}
              </button>

              <button aria-label="View notifications" className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none">
                <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ring-2 ring-offset-1 ring-transparent hover:ring-blue-500 transition-all bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Milestone celebration checker — fires on every portal page load */}
        <MilestoneChecker userName={userName} />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
