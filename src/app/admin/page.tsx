import { createClient } from "@/lib/supabase/server";
import { ModerationCard } from "@/components/admin/moderation-card";
import type { EventItem } from "@/types/database";
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Inbox,
  Terminal
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch pending events with organizer profile
  let pendingEvents: EventItem[] = [];
  let pendingCount = 0;
  let approvedCount = 0;
  let totalCount = 0;

  try {
    const { data: rawPending } = await supabase
      .from("events")
      .select("*, organizer:organizer_id(id, full_name, email, avatar_url)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (rawPending) {
      pendingEvents = rawPending as EventItem[];
    }

    const { count: pCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingCount = pCount || 0;

    const { count: aCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");
    approvedCount = aCount || 0;

    const { count: tCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });
    totalCount = tCount || 0;
  } catch {
    // Graceful fallback
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 border-b border-[#E5E7EB] pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider">
          <Terminal className="w-3 h-3 text-[#2563EB]" />
          Event Moderation Desk
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          Pending Approvals
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Review community submissions for Lahore. Verify registration links and approve or decline with feedback.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#111111]">
              {pendingCount}
            </div>
            <div className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
              Awaiting Approval
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#111111]">
              {approvedCount}
            </div>
            <div className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
              Live Approved Events
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#111111]">
              {totalCount}
            </div>
            <div className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
              Total Database Records
            </div>
          </div>
        </div>
      </div>

      {/* Pending Queue */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#111111] tracking-tight">
          Submissions Needing Review ({pendingEvents.length})
        </h2>

        {pendingEvents.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#111111]">
              All caught up! No events pending review.
            </h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              When organizers submit new events in Lahore, they will appear here for verification.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingEvents.map((evt) => (
              <ModerationCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
