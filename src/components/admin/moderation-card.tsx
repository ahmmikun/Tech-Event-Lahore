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
    <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-6 shadow-sm relative text-[#111111]">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Poster Media */}
        <div className="relative w-full lg:w-72 aspect-[16/10] rounded-xl overflow-hidden bg-[#F3F4F6] shrink-0 border border-[#E5E7EB]">
          <Image
            src={
              event.image_url ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
            }
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[10px] uppercase tracking-wider">
            Pending Review
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#111111] text-white font-mono">
              {event.category}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563]">
              {event.city_area}, Lahore
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 font-mono">
              {formatPrice(event.price_type, event.price_amount)}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-[#111111] leading-snug">
            {event.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6B7280] pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-[#111111] font-medium">{formatEventDate(event.date_start)}</span>
            </div>
            {event.time_display && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>{event.time_display}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span className="truncate">{event.venue_name} ({event.venue_address})</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span className="truncate">Organizer: {event.organizer.email}</span>
              </div>
            )}
          </div>

          {/* Description preview */}
          <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed pt-1">
            {event.description}
          </p>

          {/* External Registration Link Check */}
          <div className="pt-2 flex items-center gap-3">
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#2563EB] bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <span>Test Registration Link: {event.registration_url}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Moderation Controls Bar */}
      <div className="pt-4 border-t border-[#F3F4F6] flex flex-wrap items-center justify-end gap-3">
        {/* Decline Button */}
        <button
          type="button"
          onClick={() => setShowDeclineModal(true)}
          disabled={approving || declining}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all active:scale-98 disabled:opacity-60"
        >
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>Decline with Message...</span>
        </button>

        {/* Approve Button */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving || declining}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs text-white bg-[#111111] hover:bg-emerald-600 shadow-sm transition-all active:scale-98 disabled:opacity-60"
        >
          {approving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>{approving ? "Approving..." : "Approve & Publish"}</span>
        </button>
      </div>

      {/* Decline with Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 text-[#111111]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Decline Event Submission
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Provide a clear message explaining why this event was declined. The organizer will see this feedback in their dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151]">
                  Rejection Message / Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. The registration URL is broken or inactive. Please provide an active Luma/Google Form link, and upload a higher-resolution poster."
                  className="w-full px-4 py-3 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-rose-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Quick Preset Reasons */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#6B7280]">Quick reasons:</div>
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
                      className="px-2.5 py-1 rounded-md text-[11px] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563]"
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
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#4B5563] hover:text-[#111111] bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={declining}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center gap-1.5 disabled:opacity-60"
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
