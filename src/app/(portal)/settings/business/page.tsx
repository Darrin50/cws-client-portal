"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

// TODO: Replace with real data fetch from server action
const mockBusinessInfo = {
  businessName: "Detroit Tech Startup",
  address: "123 Michigan Avenue, Detroit, MI 48201",
  phone: "+1 (313) 555-0100",
  email: "contact@detroittech.com",
  website: "https://detroittech.com",
  hours: "Monday - Friday, 9am - 6pm EST",
  industry: "Technology / Software",
  description:
    "We build innovative tech solutions for growing businesses. Founded in 2020, based in Detroit.",
};

export default function BusinessPage() {
  const [formData, setFormData] = useState(mockBusinessInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call server action to update business info
      console.log("Saving business info:", formData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Business Information</h1>
        <p className="text-slate-400 mt-2">
          Update your company details and contact information
        </p>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form className="space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-white mb-2">
              Business Name *
            </label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              placeholder="Your business name"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
              Address
            </label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Street address, city, state, zip"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
              Phone
            </label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contact@yourbusiness.com"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
              Website
            </label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://yourbusiness.com"
            />
          </div>

          {/* Hours */}
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-white mb-2">
              Business Hours
            </label>
            <Input
              id="hours"
              value={formData.hours}
              onChange={(e) => handleChange("hours", e.target.value)}
              placeholder="Monday - Friday, 9am - 6pm EST"
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-white mb-2">
              Industry
            </label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option>Technology / Software</option>
              <option>Retail</option>
              <option>Services</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Business Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of your business..."
              className="h-24"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && (
              <p className="text-green-400 text-sm font-medium">
                Changes saved successfully
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
