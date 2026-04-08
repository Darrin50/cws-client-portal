"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
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
  FileText,
  Image as ImageIcon,
  Type,
  Calendar,
  CreditCard,
  Building2,
  Users,
  BellIcon,
  Paintbrush,
  Activity,
  Plus,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Layers,
  MapPin,
  UserCheck,
  type LucideIcon,
} from "lucide-react"
import { MilestoneChecker } from "@/components/milestones/milestone-checker"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"
import { useClerk } from "@clerk/nextjs"
import { PortalTour } from "@/components/portal-tour/portal-tour"

// ── Nav tree definition ───────────────────────────────────────────────────────

interface NavChild {
  label: string
  href: string
  icon: LucideIcon
}

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: NavChild[]
  locked?: boolean
  lockedTooltip?: string
  tourId?: string
}

interface NavSection {
  type: "section"
  label: string
}

type NavEntry = NavItem | NavSection

const NAV_TREE: NavEntry[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    tourId: "tour-dashboard",
    children: [
      { label: "Activity Feed", href: "/dashboard/activity", icon: Activity },
    ],
  },
  {
    label: "My Website",
    href: "/pages",
    icon: Monitor,
    children: [
      { label: "Request a Change", href: "/pages/request/new", icon: Plus },
    ],
  },
  {
    label: "My Brand",
    href: "/brand",
    icon: Palette,
    children: [
      { label: "Logos", href: "/brand/logos", icon: FileText },
      { label: "Colors", href: "/brand/colors", icon: Palette },
      { label: "Fonts", href: "/brand/fonts", icon: Type },
      { label: "Brand Guidelines", href: "/brand/guidelines", icon: BookOpen },
      { label: "Photos & Files", href: "/brand/photos", icon: ImageIcon },
    ],
  },
  {
    label: "Content Calendar",
    href: "/dashboard/content-calendar",
    icon: Calendar,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    tourId: "tour-messages",
    children: [
      { label: "FAQ", href: "/messages/faq", icon: HelpCircle },
    ],
  },
  {
    label: "Milestones",
    href: "/milestones",
    icon: Trophy,
  },
  // ── Intelligence ──────────────────────────────────────────────────────────
  { type: "section", label: "Intelligence" },
  {
    label: "Competitor Pulse",
    href: "/competitors",
    icon: Globe,
  },
  {
    label: "Website Audit",
    href: "/audit",
    icon: SearchCheck,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    locked: true,
    tourId: "tour-analytics",
    lockedTooltip: "Upgrade your plan to unlock Analytics",
    children: [
      { label: "Traffic Overview", href: "/analytics/traffic", icon: TrendingUp },
      { label: "Traffic Sources", href: "/analytics/sources", icon: Layers },
      { label: "Google Business", href: "/analytics/gbp", icon: MapPin },
      { label: "Lead Tracking", href: "/analytics/leads", icon: UserCheck },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileBarChart,
    locked: true,
    tourId: "tour-reports",
    lockedTooltip: "Upgrade your plan to unlock Reports",
    children: [
      { label: "Latest Report", href: "/reports/latest", icon: FileText },
    ],
  },
  {
    label: "Social Media",
    href: "/social",
    icon: Share2,
    locked: true,
    lockedTooltip: "Upgrade your plan to unlock Social Media",
    children: [
      { label: "Calendar", href: "/social/calendar", icon: Calendar },
      { label: "Posts", href: "/social/posts", icon: FileText },
      { label: "Request Post", href: "/social/request", icon: Plus },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    tourId: "tour-settings",
    children: [
      { label: "Billing & Plan", href: "/settings/billing", icon: CreditCard },
      { label: "Business Info", href: "/settings/business", icon: Building2 },
      { label: "Team Members", href: "/settings/team", icon: Users },
      { label: "Notifications", href: "/settings/notifications", icon: BellIcon },
      { label: "White Label", href: "/settings/white-label", icon: Paintbrush },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function isNavItem(entry: NavEntry): entry is NavItem {
  return !("type" in entry)
}

function isActiveHref(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

function itemHasActiveChild(item: NavItem, pathname: string): boolean {
  return (item.children ?? []).some((c) => isActiveHref(c.href, pathname))
}

function getBreadcrumbLabel(pathname: string): string {
  for (const entry of NAV_TREE) {
    if (!isNavItem(entry)) continue
    for (const child of entry.children ?? []) {
      if (isActiveHref(child.href, pathname)) return child.label
    }
    if (isActiveHref(entry.href, pathname)) return entry.label
  }
  return "Dashboard"
}

// ── NavRow ────────────────────────────────────────────────────────────────────

interface NavRowProps {
  item: NavItem
  pathname: string
  expanded: boolean
  onToggleExpand: (href: string) => void
  onNavigate: () => void
}

function NavRow({ item, pathname, expanded, onToggleExpand, onNavigate }: NavRowProps) {
  const isActive = isActiveHref(item.href, pathname)
  const hasChildren = (item.children?.length ?? 0) > 0
  const Icon = item.icon

  if (item.locked) {
    const hasLockedChildren = (item.children?.length ?? 0) > 0
    return (
      <div data-tour={item.tourId}>
        <div
          title={item.lockedTooltip}
          className="flex items-center justify-between px-2 py-2 rounded-md text-sm text-slate-600 cursor-not-allowed select-none"
        >
          <div className="flex items-center gap-2.5 pl-0.5 flex-1 min-w-0">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </div>
          <div className="flex items-center gap-1.5 pr-1 flex-shrink-0">
            <span className="text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded-full tracking-wide">
              PRO
            </span>
            {hasLockedChildren ? (
              <button
                onClick={() => onToggleExpand(item.href)}
                className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 text-slate-600",
                    expanded ? "rotate-90" : ""
                  )}
                />
              </button>
            ) : (
              <Lock className="w-3 h-3" />
            )}
          </div>
        </div>
        {hasLockedChildren && expanded && (
          <div className="ml-3 mt-0.5 border-l border-white/10 pl-2 space-y-0.5">
            {item.children!.map((child) => {
              const ChildIcon = child.icon
              return (
                <div
                  key={child.href}
                  title={item.lockedTooltip}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md text-xs text-slate-700 cursor-not-allowed select-none"
                >
                  <ChildIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                  <span className="truncate opacity-50">{child.label}</span>
                  <Lock className="w-2.5 h-2.5 ml-auto flex-shrink-0 opacity-40" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div data-tour={item.tourId}>
      {/* Parent row */}
      <div
        className={cn(
          "flex items-center justify-between rounded-md text-sm font-medium transition-all duration-150 group",
          isActive && !itemHasActiveChild(item, pathname)
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/6 hover:text-white"
        )}
      >
        {/* Left border indicator */}
        <div
          className={cn(
            "w-[3px] self-stretch rounded-l-md flex-shrink-0 transition-colors",
            isActive && !itemHasActiveChild(item, pathname)
              ? "bg-[#2563eb]"
              : "bg-transparent"
          )}
        />

        {/* Icon + Label — navigate on click */}
        <Link
          href={item.href}
          onClick={() => {
            onNavigate()
            if (hasChildren) onToggleExpand(item.href)
          }}
          className="flex-1 flex items-center gap-2.5 py-2 pl-2 pr-1 no-underline min-w-0"
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>

        {/* Chevron toggle — expand/collapse only */}
        {hasChildren && (
          <button
            onClick={() => onToggleExpand(item.href)}
            className="p-1 mr-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                expanded ? "rotate-90" : ""
              )}
            />
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-3 mt-0.5 border-l border-white/10 pl-2 space-y-0.5">
          {item.children!.map((child) => {
            const childActive = isActiveHref(child.href, pathname)
            const ChildIcon = child.icon
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 no-underline",
                  childActive
                    ? "bg-white/10 text-white"
                    : "text-slate-500 hover:bg-white/6 hover:text-slate-200"
                )}
              >
                <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── ClientLayout ──────────────────────────────────────────────────────────────

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
  const { signOut } = useClerk()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [avatarHovered, setAvatarHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const { config: wl } = useWhiteLabel()

  // Apply CSS custom property for primary color when white-label is enabled
  useEffect(() => {
    if (wl.enabled && wl.primaryColor) {
      document.documentElement.style.setProperty("--wl-primary", wl.primaryColor)
    } else {
      document.documentElement.style.removeProperty("--wl-primary")
    }
  }, [wl.enabled, wl.primaryColor])

  const primaryColor = wl.enabled && wl.primaryColor ? wl.primaryColor : "#2563eb"
  const companyName = wl.enabled && wl.companyName ? wl.companyName : "Caliber Web Studio"
  const logoUrl = wl.enabled && wl.logoUrl ? wl.logoUrl : null

  // Track which parent items are expanded. Default: auto-expand active parent.
  const getDefaultExpanded = useCallback(() => {
    const map: Record<string, boolean> = {}
    for (const entry of NAV_TREE) {
      if (!isNavItem(entry)) continue
      if (itemHasActiveChild(entry, pathname) || isActiveHref(entry.href, pathname)) {
        map[entry.href] = true
      }
    }
    return map
  }, [pathname])

  const [expanded, setExpanded] = useState<Record<string, boolean>>(getDefaultExpanded)

  // Auto-expand when route changes to a child path
  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev }
      for (const entry of NAV_TREE) {
        if (!isNavItem(entry)) continue
        if (itemHasActiveChild(entry, pathname)) {
          next[entry.href] = true
        }
      }
      return next
    })
  }, [pathname])

  function toggleExpand(href: string) {
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }))
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setProfilePic(ev.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  const breadcrumb = getBreadcrumbLabel(pathname)

  return (
    <div className="flex h-screen bg-[var(--page-bg)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-[#0a0e1a] md:static md:translate-x-0 transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="px-4 py-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-7 w-7 object-contain flex-shrink-0 rounded"
              />
            ) : (
              <Image
                src="/logo.png"
                alt="CWS"
                width={28}
                height={28}
                className="object-contain flex-shrink-0"
                priority
              />
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">
                {companyName}
              </p>
              <p className="text-slate-500 text-[10px] leading-tight">Client Portal</p>
            </div>
          </div>
        </div>

        {/* Nav Tree */}
        <nav
          aria-label="Main navigation"
          className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
        >
          {NAV_TREE.map((entry, idx) => {
            if (!isNavItem(entry)) {
              return (
                <div key={`section-${idx}`} className="pt-3 pb-1 px-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    {entry.label}
                  </p>
                </div>
              )
            }
            return (
              <NavRow
                key={entry.href}
                item={entry}
                pathname={pathname}
                expanded={!!expanded[entry.href]}
                onToggleExpand={toggleExpand}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            )
          })}
        </nav>

        {/* User Section */}
        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Clickable avatar */}
            <div
              className="relative w-8 h-8 rounded-full flex-shrink-0 cursor-pointer"
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              {profilePic ? (
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={32}
                  height={32}
                  unoptimized
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/15"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/15"
                  style={{ backgroundColor: primaryColor }}
                >
                  {userInitials}
                </div>
              )}
              {avatarHovered && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-white" />
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
              <p className="text-xs font-medium text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
            </div>
            <button
              aria-label="Sign out"
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
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
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-sm">
              <span className="text-slate-400">Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-[var(--text-primary)]">{breadcrumb}</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
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

              <button
                aria-label="View notifications"
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none"
              >
                <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ring-2 ring-offset-1 ring-transparent hover:ring-[#2563eb] transition-all text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Milestone celebration checker */}
        <MilestoneChecker userName={userName} />

        {/* First-time portal tour */}
        <PortalTour />
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
