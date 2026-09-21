"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  CalendarPlus, 
  Check, 
  Copy, 
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { 
  buildGoogleCalendarUrl, 
  buildWhatsAppShareUrl, 
  buildTwitterShareUrl 
} from "@/lib/utils";
import type { EventItem } from "@/types/database";

interface EventActionsProps {
  event: EventItem;
}

export function EventActions({ event }: EventActionsProps) {
  const [copied, setCopied] = useState(false);
  const calendarUrl = buildGoogleCalendarUrl(event);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Event link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    if (typeof window !== "undefined") {
      const url = buildWhatsAppShareUrl(event.title, window.location.href);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleTwitter = () => {
    if (typeof window !== "undefined") {
      const url = buildTwitterShareUrl(event.title, window.location.href);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary External Registration Button */}
      <a
        href={event.registration_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-[#2563EB] hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all duration-200 active:scale-98 group"
      >
        <span>Register on Official Site</span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      <p className="text-[11px] text-center text-[#6B7280]">
        You will be redirected directly to the organizer&apos;s registration / ticketing portal.
      </p>

      {/* Utility buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Add to Google Calendar */}
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-[#111111] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-[#2563EB]" />
          Add to Calendar
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-[#111111] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Social Sharing */}
      <div className="pt-3 border-t border-[#F3F4F6]">
        <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          Share with your network:
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleTwitter}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-[#111111] border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X / Twitter
          </button>
        </div>
      </div>
    </div>
  );
}
