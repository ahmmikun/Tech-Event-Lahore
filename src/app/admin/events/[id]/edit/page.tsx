import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/events/event-form";
import type { EventItem } from "@/types/database";
import { ArrowLeft, Pencil, Terminal } from "lucide-react";

export const revalidate = 0;

interface AdminEditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEditEventPage({ params }: AdminEditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let event: EventItem | null = null;
  try {
    const { data } = await supabase
      .from("events")
      .select("*, organizer:organizer_id(id, full_name, email)")
      .eq("id", id)
      .single();

    if (data) {
      event = data as EventItem;
    }
  } catch {
    // Handled below
  }

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-8 text-[#111111] max-w-4xl">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E5E7EB] pb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Management
        </Link>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider">
            <Pencil className="w-3.5 h-3.5" />
            Administrative Editor
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Edit: {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Update details, moderation status, archiving, dates, venue, or ticket link for this event.
          </p>
        </div>
      </div>

      <EventForm
        role="admin"
        mode="edit"
        initialData={event}
        redirectPath="/admin/events"
      />
    </div>
  );
}
