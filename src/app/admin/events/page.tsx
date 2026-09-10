import { createClient } from "@/lib/supabase/server";
import { EventsTable } from "./events-table";
import type { EventItem } from "@/types/database";
import { Calendar } from "lucide-react";

export const revalidate = 0;

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*, organizer:organizer_id(id, full_name, email)")
    .order("created_at", { ascending: false });

  const events = (data as EventItem[]) || [];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          Event Management
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          All Events ({events.length})
        </h1>
        <p className="text-sm text-slate-400">
          Manage, toggle featured spots, or delete events across the entire Lahore directory.
        </p>
      </div>

      <EventsTable initialEvents={events} />
    </div>
  );
}
