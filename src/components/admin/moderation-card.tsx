"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { EventItem } from "@/types/database";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  User, 
  AlertTriangle,
  Loader2
} from "lucide-react";

interface ModerationCardProps {
  event: EventItem;
  onActionComplete?: () => void;
}

export function ModerationCard({ event, onActionComplete }: ModerationCardProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    setApproving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .update({
          status: "approved",
          rejection_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      if (error) throw error;

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      toast.success(`"${event.title}" approved and is now live on Lahore directory!`);
      if (onActionComplete) onActionComplete();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve event");
    } finally {
      setApproving(false);
    }
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason or message for declining this event.");
      return;
    }

    setDeclining(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      if (error) throw error;

      toast.info(`Event declined. Feedback message sent to organizer.`);
      setShowDeclineModal(false);
      if (onActionComplete) onActionComplete();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to decline event");
    } finally {
      setDeclining(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0e1424] border-2 border-amber-500/30 space-y-6 shadow-xl relative">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Poster Media */}
        <div className="relative w-full lg:w-72 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700/80">
          <Image
            src={
              event.image_url ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
            }
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
            Pending Review
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-600/20 text-orange-400 border border-orange-500/30">
              {event.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300">
              {event.city_area}, Lahore
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-emerald-400 font-mono">
              {formatPrice(event.price_type, event.price_amount)}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {event.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>{formatEventDate(event.date_start)}</span>
            </div>
            {event.time_display && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>{event.time_display}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span className="truncate">{event.venue_name} ({event.venue_address})</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span className="truncate">Organizer: {event.organizer.email}</span>
              </div>
            )}
          </div>

          {/* Description preview */}
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed pt-1">
            {event.description}
          </p>

          {/* External Registration Link Check */}
          <div className="pt-2 flex items-center gap-3">
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-sky-400 bg-sky-950/40 border border-sky-500/30 hover:bg-sky-900/40 transition-colors"
            >
              <span>Test Registration Link: {event.registration_url}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Moderation Controls Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-3">
        {/* Decline Button */}
        <button
          type="button"
          onClick={() => setShowDeclineModal(true)}
          disabled={approving || declining}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-red-300 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 transition-all active:scale-95 disabled:opacity-60"
        >
          <XCircle className="w-4 h-4 text-red-400" />
          <span>Decline with Message...</span>
        </button>

        {/* Approve Button */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving || declining}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-60"
        >
          {approving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{approving ? "Approving..." : "Approve & Publish"}</span>
        </button>
      </div>

      {/* Decline with Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1424] border-2 border-red-500/50 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Decline Event Submission
                </h3>
                <p className="text-xs text-slate-400">
                  Provide a clear message explaining why this event was declined. The organizer will see this feedback in their dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Rejection Message / Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. The registration URL is broken or inactive. Please provide an active Ticketwala/Google Form link, and upload a higher-resolution poster."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-sm focus:border-red-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Quick Preset Reasons */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400">Quick reasons:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Invalid registration link",
                    "Low quality poster image",
                    "Missing detailed venue address",
                    "Duplicate submission",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={declining}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/30 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {declining && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{declining ? "Submitting..." : "Confirm Decline"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
