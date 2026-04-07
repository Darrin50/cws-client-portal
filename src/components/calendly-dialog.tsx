"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";

const CALENDLY_URL =
  "https://calendly.com/singerdarrin50-ds/strategy-call-office-hours";

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
  label = "📅 Book Office Hours",
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
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-0">
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Book a Strategy Call
            </DialogTitle>
          </DialogHeader>
          <div className="h-[580px]">
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
