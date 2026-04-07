"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Mail, MessageSquare, Bell, CheckCircle, Info } from "lucide-react";

type Channel = "email" | "sms" | "inApp";
type Category = "Request Updates" | "Messages" | "Reports" | "Social" | "Billing";

interface Preferences {
  [category: string]: Record<Channel, boolean>;
}

const defaultPreferences: Preferences = {
  "Request Updates": { email: true, sms: false, inApp: true },
  Messages: { email: true, sms: true, inApp: true },
  Reports: { email: true, sms: false, inApp: false },
  Social: { email: false, sms: false, inApp: true },
  Billing: { email: true, sms: false, inApp: true },
};

const categoryDescriptions: Record<string, string> = {
  "Request Updates": "When a page request status changes or has a new comment",
  Messages: "When you receive a new message from your CWS team",
  Reports: "When your monthly performance report is ready",
  Social: "When a social post is approved, rejected, or published",
  Billing: "Invoice receipts, payment failures, and plan changes",
};

const channels: { key: Channel; label: string; icon: React.ElementType; description: string }[] = [
  {
    key: "email",
    label: "Email",
    icon: Mail,
    description: "Receive notifications directly in your inbox",
  },
  {
    key: "sms",
    label: "SMS",
    icon: MessageSquare,
    description: "Get text message alerts for urgent updates",
  },
  {
    key: "inApp",
    label: "In-App",
    icon: Bell,
    description: "See notifications when you're in the portal",
  },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      aria-label={label}
      role="switch"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
        checked ? "bg-blue-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

type ToastState = "idle" | "saving" | "saved" | "error";

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<Preferences>(
    JSON.parse(JSON.stringify(defaultPreferences))
  );
  const [toast, setToast] = useState<ToastState>("idle");

  const handleToggle = (category: string, channel: Channel, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: { ...prev[category], [channel]: value },
    }));
  };

  const handleSave = async () => {
    setToast("saving");
    try {
      // TODO: Call server action saveNotificationPreferences(preferences)
      await new Promise((r) => setTimeout(r, 700));
      setToast("saved");
      setTimeout(() => setToast("idle"), 3500);
    } catch {
      setToast("error");
      setTimeout(() => setToast("idle"), 3500);
    }
  };

  const categories = Object.keys(preferences) as Category[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 mt-2">
          Control how and when you receive updates from your CWS team
        </p>
      </div>

      {/* Preferences Grid */}
      <Card className="overflow-hidden bg-slate-800 border-slate-700">
        {/* Column Headers */}
        <div className="p-6 border-b border-slate-700">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="col-span-1" />
            <div className="col-span-3 grid grid-cols-3 gap-4">
              {channels.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-semibold text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-700">
          {categories.map((category) => (
            <div
              key={category}
              className="p-6 hover:bg-slate-700/20 transition-colors"
            >
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="col-span-1">
                  <p className="font-semibold text-white text-sm">{category}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {categoryDescriptions[category]}
                  </p>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  {channels.map(({ key, label }) => (
                    <ToggleSwitch
                      key={key}
                      checked={preferences[category][key]}
                      onChange={(v) => handleToggle(category, key, v)}
                      label={`${category} ${label} notifications`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={toast === "saving" || toast === "saved"}
        >
          {toast === "saving"
            ? "Saving..."
            : toast === "saved"
            ? "Saved"
            : "Save Preferences"}
        </Button>

        {/* Toast */}
        {toast === "saved" && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CheckCircle className="w-4 h-4" />
            Preferences saved successfully
          </div>
        )}
        {toast === "error" && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
            <Info className="w-4 h-4" />
            Failed to save. Please try again.
          </div>
        )}
      </div>

      {/* Channel Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {channels.map(({ key, label, icon: Icon, description }) => (
          <Card key={key} className="p-5 bg-blue-900/10 border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white">{label}</h3>
            </div>
            <p className="text-sm text-slate-300">{description}</p>
          </Card>
        ))}
      </div>

      {/* SMS notice */}
      <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          SMS notifications require a verified phone number on your account. You
          can add or update your phone number in{" "}
          <a href="/settings/business" className="text-blue-400 hover:underline">
            Business Settings
          </a>
          . Standard message rates may apply.
        </p>
      </div>
    </div>
  );
}
