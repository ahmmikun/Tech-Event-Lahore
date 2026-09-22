import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/events/event-form";
import type { EventItem } from "@/types/database";
import { ArrowLeft, Pencil, Terminal, Lock } from "lucide-react";

export const revalidate = 0;

interface EditSubmissionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSubmissionPage({ params }: EditSubmissionPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/my-events/edit/${id}`);
  }

  let event: EventItem | null = null;
  try {
    const { data } = await supabase
      .from("events")
      .select("*")
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

  // Security check: Must be the organizer
  if (event.organizer_id !== user.id) {
    redirect("/my-events");
  }

  // Check if event is approved: Users cannot directly edit approved events
  if (event.status === "approved") {
    return (
      <div className="min-h-screen py-16 bg-[#FAFAF8] text-[#111111] px-4">
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-md text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Event is Live & Locked
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              &quot;{event.title}&quot; is already approved and live on the public directory. To preserve verified community information, organizers cannot modify live events directly.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] text-xs text-[#6B7280]">
            Need to update dates, venue, or ticket links? Please contact an administrator to request updates.
          </div>
          <div className="flex justify-center gap-3">
            <Link
              href="/my-events"
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB] transition-colors"
            >
              Back to My Submissions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-[#FAFAF8] text-[#111111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-3 border-b border-[#E5E7EB] pb-6">
          <Link
            href="/my-events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Submissions
          </Link>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider">
              <Pencil className="w-3.5 h-3.5" />
              Submission Editor
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Edit Event: {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Modify details, dates, poster, or ticket link before approval. Saving changes will resubmit your event to the moderation team.
            </p>
          </div>
        </div>

        <EventForm
          role="user"
          mode="edit"
          initialData={event}
          redirectPath="/my-events"
        />
      </div>
    </div>
  );
}
