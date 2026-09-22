import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyEventsList } from "./my-events-list";
import type { EventItem } from "@/types/database";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  PlusCircle, 
  Terminal,
  Archive
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
  const archivedEvents = events.filter((e) => e.status === "archived");

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
              Track review status, edit unapproved submissions, or remove unapproved events in Lahore.
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
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111111] tracking-tight">
              Submission History ({events.length})
            </h2>
            <div className="text-[11px] text-[#6B7280] font-mono">
              Unapproved events can be edited or deleted anytime
            </div>
          </div>

          <MyEventsList initialEvents={events} />
        </div>
      </div>
    </div>
  );
}
