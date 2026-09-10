import { createClient } from "@/lib/supabase/server";
import { ModerationCard } from "@/components/admin/moderation-card";
import type { EventItem } from "@/types/database";
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  Inbox
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch pending events with organizer profile
  const { data: rawPending } = await supabase
    .from("events")
    .select("*, organizer:organizer_id(id, full_name, email, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Metric counts
  const { count: pendingCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: approvedCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: totalCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true });

  const pendingEvents = (rawPending as EventItem[]) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          Event Moderation Desk
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Pending Approvals
        </h1>
        <p className="text-sm text-slate-400">
          Review community submissions. Verify ticket links and approve or decline with feedback.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e1424] border border-amber-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {pendingCount || 0}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Awaiting Approval
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1424] border border-emerald-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {approvedCount || 0}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live Approved Events
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {totalCount || 0}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Database Records
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>Pending Submissions Queue</span>
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-black font-black rounded-full">
              {pendingEvents.length}
            </span>
          </h2>
        </div>

        {pendingEvents.length > 0 ? (
          <div className="space-y-6">
            {pendingEvents.map((event) => (
              <ModerationCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-[#0e1424] border border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">
              Queue is completely clear!
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              All submitted events for Lahore have been moderated. New submissions will appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
