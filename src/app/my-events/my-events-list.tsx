"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { EventItem } from "@/types/database";
import { formatEventDate } from "@/lib/utils";
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  Pencil,
  Trash2,
  Lock,
  Archive,
  PlusCircle,
  Loader2,
  HelpCircle
} from "lucide-react";

interface MyEventsListProps {
  initialEvents: EventItem[];
}

export function MyEventsList({ initialEvents }: MyEventsListProps) {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (event: EventItem) => {
    if (event.status === "approved") {
      toast.error("Approved live events cannot be deleted directly. Please contact an admin.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${event.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(event.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success(`Event "${event.title}" was deleted.`);
      router.refresh();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete submission.");
    } finally {
      setDeletingId(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E7EB] space-y-4 shadow-sm">
        <p className="text-xs text-[#6B7280]">
          You haven&apos;t submitted any events to Lahore Tech Events yet.
        </p>
        <Link
          href="/submit-event"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Submit your first event
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isPending = event.status === "pending";
        const isApproved = event.status === "approved";
        const isRejected = event.status === "rejected";
        const isArchived = event.status === "archived";
        const canUserModify = isPending || isRejected;

        return (
          <div
            key={event.id}
            className="p-5 sm:p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
          >
            <div className="flex items-start gap-4 flex-1 w-full">
              {/* Thumbnail */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#F3F4F6] shrink-0 border border-[#E5E7EB]">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#9CA3AF]">
                    NO IMG
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                      isApproved
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isPending
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : isArchived
                        ? "bg-slate-100 text-slate-700 border border-slate-300"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isPending && <Clock3 className="w-3 h-3 text-amber-600" />}
                    {isArchived && <Archive className="w-3 h-3 text-slate-600" />}
                    {isRejected && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                    <span>{event.status}</span>
                  </span>

                  <span className="text-[11px] font-mono text-[#6B7280]">
                    {event.category}
                  </span>

                  {isApproved && (
                    <span className="text-[10px] text-slate-500 font-mono inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <Lock className="w-2.5 h-2.5" />
                      Locked (Live)
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#111111] truncate">
                  {event.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1 text-[#111111]">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    {formatEventDate(event.date_start)}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    {event.venue_name} ({event.city_area})
                  </span>
                </div>

                {/* Rejection feedback */}
                {isRejected && event.rejection_reason && (
                  <div className="mt-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-950">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Moderator Review Notes:
                    </div>
                    <p className="pl-5 leading-relaxed">{event.rejection_reason}</p>
                    <p className="pl-5 text-[11px] font-mono text-rose-800">
                      Click &quot;Edit Submission&quot; to resolve these issues and resubmit for approval.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
              {/* If Unapproved (Pending or Rejected): Allow Edit & Delete */}
              {canUserModify ? (
                <>
                  <Link
                    href={`/my-events/edit/${event.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#111111] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Submission</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(event)}
                    disabled={deletingId === event.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    {deletingId === event.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                /* Approved event */
                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${event.slug}`}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB] transition-colors"
                  >
                    View Live
                  </Link>

                  <span
                    className="p-2 text-[#9CA3AF] hover:text-[#6B7280] cursor-help"
                    title="Live events cannot be altered directly to protect verified directory integrity. Contact an admin if you need updates."
                  >
                    <HelpCircle className="w-4 h-4" />
                  </span>
                </div>
              )}

              {/* Registration Link Test */}
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg text-xs font-medium text-[#4B5563] hover:text-[#111111] border border-[#E5E7EB] hover:bg-[#F9FAFB] flex items-center gap-1"
                title="Open registration URL"
              >
                <span>Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
