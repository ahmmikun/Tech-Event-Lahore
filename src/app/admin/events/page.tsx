import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventsTable } from "./events-table";
import type { EventItem } from "@/types/database";
import { PlusCircle, Terminal } from "lucide-react";

export const revalidate = 0;

export default async function AdminEventsPage() {
  const supabase = await createClient();

  let events: EventItem[] = [];
  try {
    const { data } = await supabase
      .from("events")
      .select("*, organizer:organizer_id(id, full_name, email)")
      .order("created_at", { ascending: false });

    if (data) {
      events = data as EventItem[];
    }
  } catch {
    // Graceful fallback
  }

  return (
    <div className="space-y-8 text-[#111111]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            Event Records
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            All Events ({events.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Manage, edit details, toggle featured spots, archive, or delete event listings across Lahore.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      <EventsTable initialEvents={events} />
    </div>
  );
}
