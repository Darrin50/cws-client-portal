"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Palette, Globe, Building2, Image, Save, CheckCircle2 } from "lucide-react";

interface WhiteLabelSettings {
  logoUrl: string | null;
  primaryColor: string | null;
  companyName: string | null;
  customDomain: string | null;
}

export default function WhiteLabelPage() {
  const [settings, setSettings] = useState<WhiteLabelSettings>({
    logoUrl: null,
    primaryColor: "#2563eb",
    companyName: null,
    customDomain: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/settings/white-label");
    if (res.status === 403) {
      setLocked(true);
      const json = await res.json();
      setLockMessage(json.error ?? "Upgrade to Domination to unlock white-label.");
      setLoading(false);
      return;
    }
    if (res.ok) {
      const json = await res.json();
      setSettings({
        logoUrl: json.data?.logoUrl ?? null,
        primaryColor: json.data?.primaryColor ?? "#2563eb",
        companyName: json.data?.companyName ?? null,
        customDomain: json.data?.customDomain ?? null,
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings/white-label", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            White-Label Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Custom branding for your client portal
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Domination Plan Required
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            White-label mode lets you replace the Caliber branding with your own logo, colors, and
            company name. Available exclusively on the Domination plan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Badge className="bg-[#0d9488]/10 text-[#0d9488] border border-[#0d9488]/30 px-3 py-1">
              Domination Plan Feature
            </Badge>
            <a href="/settings/billing" className="no-underline">
              <Button className="bg-[#2563eb] hover:bg-blue-700 text-white">
                Upgrade to Domination
              </Button>
            </a>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
            {[
              { icon: Image, title: "Custom Logo", desc: "Replace CWS logo with your own" },
              { icon: Palette, title: "Brand Colors", desc: "Set your primary brand color" },
              { icon: Globe, title: "Custom Domain", desc: "Serve portal on your domain" },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 opacity-60"
              >
                <Icon className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
              White-Label Settings
            </h1>
            <Badge className="bg-[#0d9488]/10 text-[#0d9488] border border-[#0d9488]/30">
              Domination
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Override Caliber branding for your organization's portal members.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2563eb] hover:bg-blue-700 text-white"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? "Saving…" : "Save Changes"}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Name */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-[#2563eb]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Company Name
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Replaces "Caliber Web Studio" in the portal
              </p>
            </div>
          </div>
          <Input
            placeholder="Your Company Name"
            value={settings.companyName ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, companyName: e.target.value || null }))}
          />
        </Card>

        {/* Primary Color */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Palette className="w-4.5 h-4.5 text-pink-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Primary Color
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overrides Caliber Blue (#2563eb) with your brand color
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor ?? "#2563eb"}
              onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
            />
            <Input
              value={settings.primaryColor ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value || null }))}
              placeholder="#2563eb"
              className="font-mono"
            />
            {settings.primaryColor && (
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 border border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: settings.primaryColor }}
              />
            )}
          </div>
        </Card>

        {/* Logo URL */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Image className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Custom Logo URL
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct link to your logo image (PNG or SVG recommended)
              </p>
            </div>
          </div>
          <Input
            placeholder="https://yourdomain.com/logo.png"
            value={settings.logoUrl ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, logoUrl: e.target.value || null }))}
          />
          {settings.logoUrl && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Preview:</p>
              <img
                src={settings.logoUrl}
                alt="Custom logo preview"
                className="max-h-12 max-w-[200px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </Card>

        {/* Custom Domain */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-[#0d9488]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Custom Domain
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Serve your portal at a custom domain (requires DNS setup)
              </p>
            </div>
          </div>
          <Input
            placeholder="portal.yourcompany.com"
            value={settings.customDomain ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, customDomain: e.target.value || null }))}
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Add a CNAME record pointing to{" "}
            <span className="font-mono text-[#2563eb]">portal.caliberwebstudio.com</span>
          </p>
        </Card>
      </div>

      {/* Preview */}
      {(settings.companyName || settings.primaryColor || settings.logoUrl) && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Brand Preview
          </h3>
          <div
            className="rounded-xl p-5 text-white"
            style={{ backgroundColor: settings.primaryColor ?? "#2563eb" }}
          >
            <div className="flex items-center gap-3 mb-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-xs font-bold">
                  {(settings.companyName ?? "CWS").substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-semibold">{settings.companyName ?? "Caliber Web Studio"}</span>
            </div>
            <p className="text-white/80 text-sm">Client Portal — branded preview</p>
          </div>
        </Card>
      )}
    </div>
  );
}
