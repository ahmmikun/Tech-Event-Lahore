"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  CalendarPlus, 
  Share2, 
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
        className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/35 hover:shadow-orange-600/50 transition-all duration-200 active:scale-98 group"
      >
        <span>Register on Official Site</span>
        <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      <p className="text-[11px] text-center text-slate-400">
        You will be redirected to the organizer's external booking/form link.
      </p>

      {/* Utility buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        {/* Add to Google Calendar */}
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700/80 hover:border-slate-500 hover:text-white transition-colors"
        >
          <CalendarPlus className="w-4 h-4 text-orange-400" />
          Add to Calendar
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700/80 hover:border-slate-500 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Social Sharing */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Share with Lahore friends:
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleTwitter}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter / X
          </button>
        </div>
      </div>
    </div>
  );
}
