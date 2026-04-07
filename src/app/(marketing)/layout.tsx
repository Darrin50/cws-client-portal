"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, Twitter, Instagram, Linkedin, Facebook } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-[#0a0e1a]/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Caliber Web Studio"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-bold text-white text-base leading-tight hidden sm:block">
            Caliber Web Studio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[#2563eb] bg-[#2563eb]/10"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-[#2563eb] hover:bg-[#2563eb] text-white font-semibold shadow-lg shadow-blue-500/20"
            >
              Get Your Free Demo
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0a0e1a] border-slate-800 w-72">
              <div className="flex flex-col h-full pt-8">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 px-6 mb-8">
                  <Image src="/logo.png" alt="Caliber Web Studio" width={28} height={28} className="rounded-md" />
                  <span className="font-bold text-white text-sm">Caliber Web Studio</span>
                </div>

                {/* Mobile Links */}
                <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4 flex-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "px-3 py-3 rounded-md text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "text-[#2563eb] bg-[#2563eb]/10"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile CTAs */}
                <div className="flex flex-col gap-3 px-4 pb-8 pt-4 border-t border-slate-800">
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full text-slate-300 hover:text-white hover:bg-slate-800 justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-[#2563eb] hover:bg-[#2563eb] text-white font-semibold">
                      Get Your Free Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="bg-[#0a0f1e] border-t border-slate-800">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Caliber Web Studio" width={32} height={32} className="rounded-md" />
              <span className="font-bold text-white text-base">Caliber Web Studio</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              The most affordable AI-powered website platform for small businesses — $0 down, cancel anytime.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/caliberwebstudio" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter" className="text-slate-500 hover:text-[#2563eb] transition-colors focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none rounded">
                <Twitter className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="https://instagram.com/caliberwebstudio" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="text-slate-500 hover:text-[#2563eb] transition-colors focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none rounded">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="https://linkedin.com/company/caliber-web-studio" target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn" className="text-slate-500 hover:text-[#2563eb] transition-colors focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none rounded">
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="https://facebook.com/caliberwebstudio" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="text-slate-500 hover:text-[#2563eb] transition-colors focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none rounded">
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Case Studies", href: "/case-studies" },
                { label: "FAQ", href: "/faq" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "/careers" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-3 mb-6">
              {[
                { label: "Contact", href: "/contact" },
                { label: "Client Portal", href: "/dashboard" },
                { label: "Status", href: "/status" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Caliber Web Studio LLC. Built in Detroit.
          </p>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-[#2563eb]" />
            <span className="text-slate-500 text-xs">AI-powered. Detroit-built.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <MarketingNav />
      <main className="pt-16">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
