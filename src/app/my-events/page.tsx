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
  Sparkles,
  ArrowRight
} from "lucide-react";

export const revalidate = 0;

export default async function MyEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my-events");
  }

  // Fetch events submitted by this user
  const { data: rawEvents } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  const events = (rawEvents as EventItem[]) || [];

  const pendingEvents = events.filter((e) => e.status === "pending");
  const approvedEvents = events.filter((e) => e.status === "approved");
  const rejectedEvents = events.filter((e) => e.status === "rejected");

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Organizer Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Submitted Events
            </h1>
            <p className="text-sm text-slate-400">
              Track moderation status and feedback for your event submissions
            </p>
          </div>

          <Link
            href="/submit-event"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Event
          </Link>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{pendingEvents.length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending Review
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{approvedEvents.length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Approved & Live
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{rejectedEvents.length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Needs Revision / Declined
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.length > 0 ? (
            events.map((event) => {
              const isApproved = event.status === "approved";
              const isPending = event.status === "pending";
              const isRejected = event.status === "rejected";

              return (
                <div
                  key={event.id}
                  className="p-6 rounded-3xl bg-[#0e1424] border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Media + Info */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700/80">
                        <Image
                          src={
                            event.image_url ||
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80"
                          }
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-800 text-orange-400 border border-slate-700">
                            {event.category}
                          </span>
                          <span className="text-xs text-slate-400">
                            {event.city_area}, Lahore
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-white">
                          {event.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatEventDate(event.date_start)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {event.venue_name}
                          </span>
                          <span className="font-bold text-slate-300">
                            {formatPrice(event.price_type, event.price_amount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Action */}
                    <div className="flex flex-col sm:items-end gap-3 shrink-0">
                      {isPending && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                          <Clock3 className="w-3.5 h-3.5" />
                          Pending Review
                        </div>
                      )}

                      {isApproved && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved & Live
                        </div>
                      )}

                      {isRejected && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Declined
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {isApproved && (
                          <Link
                            href={`/events/${event.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                          >
                            <span>View Live</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700/80 hover:text-white"
                        >
                          <span>Test Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Message Alert if Declined */}
                  {isRejected && (
                    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-1 text-xs">
                      <div className="font-extrabold text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        Admin Feedback & Reason for Decline:
                      </div>
                      <p className="text-red-200 leading-relaxed font-medium">
                        "{event.rejection_reason || "The event could not be verified. Please ensure the registration link and venue details are correct."}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No submissions yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                You haven't posted any events on Event Finder Lahore yet.
              </p>
              <Link
                href="/submit-event"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500"
              >
                <PlusCircle className="w-4 h-4" />
                Post Your First Event
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
