"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Calendar, X } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/caliberwebstudio/office-hours";

interface CalendlyDialogProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
}

export function CalendlyDialog({
  variant = "default",
  size = "default",
  className = "",
  label = "Book Office Hours",
}: CalendlyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={`bg-[#2563eb] hover:bg-blue-700 text-white ${className}`}
      >
        <Calendar className="w-4 h-4 mr-1.5" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden gap-0">
          {/* Caliber Blue Header */}
          <div className="bg-[#2563eb] px-6 py-5 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">
                Book Your Office Hours
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Book a 30-min Office Hours call with your growth partner
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white ml-4 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Calendly Embed */}
          <div className="h-[600px]">
            <iframe
              src={CALENDLY_URL}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Book Office Hours with Caliber Web Studio"
              className="border-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
