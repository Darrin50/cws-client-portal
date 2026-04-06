"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// TODO: Replace with real data fetch from server action
const mockNotificationPreferences = {
  "Request Updates": {
    email: true,
    sms: false,
    inApp: true,
  },
  Messages: {
    email: true,
    sms: true,
    inApp: true,
  },
  Reports: {
    email: true,
    sms: false,
    inApp: false,
  },
  Social: {
    email: false,
    sms: false,
    inApp: true,
  },
  Billing: {
    email: true,
    sms: false,
    inApp: true,
  },
};

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

type NotificationCategory = keyof typeof mockNotificationPreferences;
type Channel = "email" | "sms" | "inApp";

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState(mockNotificationPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (
    category: NotificationCategory,
    channel: Channel,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: value,
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call server action to save preferences
      console.log("Saving notification preferences:", preferences);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 mt-2">
          Control how and when you receive updates
        </p>
      </div>

      {/* Notification Preferences */}
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <p className="text-sm font-semibold text-white">Notification Type</p>
            </div>
            <div className="col-span-3">
              <div className="grid grid-cols-3 gap-4">
                <p className="text-sm font-semibold text-white">Email</p>
                <p className="text-sm font-semibold text-white">SMS</p>
                <p className="text-sm font-semibold text-white">In-App</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-700">
          {Object.entries(preferences).map(([category, channels]) => (
            <div
              key={category}
              className="p-6 hover:bg-slate-700/30 transition-colors"
            >
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="col-span-1">
                  <p className="font-semibold text-white">{category}</p>
                </div>
                <div className="col-span-3">
                  <div className="grid grid-cols-3 gap-4">
                    <ToggleSwitch
                      checked={channels.email}
                      onChange={(value) =>
                        handleToggle(
                          category as NotificationCategory,
                          "email",
                          value
                        )
                      }
                    />
                    <ToggleSwitch
                      checked={channels.sms}
                      onChange={(value) =>
                        handleToggle(
                          category as NotificationCategory,
                          "sms",
                          value
                        )
                      }
                    />
                    <ToggleSwitch
                      checked={channels.inApp}
                      onChange={(value) =>
                        handleToggle(
                          category as NotificationCategory,
                          "inApp",
                          value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
        {saved && (
          <p className="text-green-400 text-sm font-medium">
            Preferences saved successfully
          </p>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-900/10 border-blue-700">
          <h3 className="font-semibold text-white mb-2">Email</h3>
          <p className="text-sm text-slate-300">
            Receive notifications directly in your inbox
          </p>
        </Card>
        <Card className="p-6 bg-blue-900/10 border-blue-700">
          <h3 className="font-semibold text-white mb-2">SMS</h3>
          <p className="text-sm text-slate-300">
            Get text message alerts for urgent updates
          </p>
        </Card>
        <Card className="p-6 bg-blue-900/10 border-blue-700">
          <h3 className="font-semibold text-white mb-2">In-App</h3>
          <p className="text-sm text-slate-300">
            See notifications when you're in the portal
          </p>
        </Card>
      </div>
    </div>
  );
}
