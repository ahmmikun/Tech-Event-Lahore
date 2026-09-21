import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/types/database";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  PlusCircle, 
  Terminal,
  ArrowRight
} from "lucide-react";

export const revalidate = 0;

export default async function MyEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my-events");
  }

  let events: EventItem[] = [];
  try {
    const { data: rawEvents } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false });

    if (rawEvents) {
      events = rawEvents as EventItem[];
    }
  } catch {
    // Graceful fallback
  }

  const pendingEvents = events.filter((e) => e.status === "pending");
  const approvedEvents = events.filter((e) => e.status === "approved");
  const rejectedEvents = events.filter((e) => e.status === "rejected");

  return (
    <div className="min-h-screen py-12 bg-[#FAFAF8] text-[#111111]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#E5E7EB] text-[#111111] text-xs font-mono tracking-wider shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
              ORGANIZER DASHBOARD
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              My Submitted Events
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Track review status and community approval for your events in Lahore
            </p>
          </div>

          <Link
            href="/submit-event"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Event
          </Link>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#111111]">{pendingEvents.length}</div>
              <div className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
                Pending Review
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#111111]">{approvedEvents.length}</div>
              <div className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
                Approved & Live
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#111111]">{rejectedEvents.length}</div>
              <div className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
                Needs Attention
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#111111] tracking-tight">
            Submission History ({events.length})
          </h2>

          {events.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E7EB] space-y-4 shadow-sm">
              <p className="text-xs text-[#6B7280]">
                You haven&apos;t submitted any events to Lahore Tech Events yet.
              </p>
              <Link
                href="/submit-event"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB]"
              >
                <PlusCircle className="w-4 h-4" />
                Submit your first event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const isPending = event.status === "pending";
                const isApproved = event.status === "approved";
                const isRejected = event.status === "rejected";

                return (
                  <div
                    key={event.id}
                    className="p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4 flex-1">
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
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {event.status}
                          </span>
                          <span className="text-[11px] font-mono text-[#6B7280]">
                            {event.category}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-[#111111]">
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
                          <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                            <span className="font-bold">Moderator Feedback: </span>
                            {event.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {isApproved && (
                        <Link
                          href={`/events/${event.slug}`}
                          className="px-3.5 py-2 rounded-lg text-xs font-bold text-[#111111] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
                        >
                          View Live
                        </Link>
                      )}

                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#4B5563] hover:text-[#111111] border border-[#E5E7EB] hover:bg-[#F9FAFB] flex items-center gap-1"
                      >
                        <span>Ticket Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
