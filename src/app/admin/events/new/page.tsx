import Link from "next/link";
import { EventForm } from "@/components/events/event-form";
import { ArrowLeft, PlusCircle, Terminal } from "lucide-react";

export const revalidate = 0;

export default function AdminNewEventPage() {
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
            <Terminal className="w-3.5 h-3.5" />
            Admin Publisher
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Create Event as Administrator
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Directly post an approved or customized event listing for the Lahore community directory.
          </p>
        </div>
      </div>

      <EventForm role="admin" mode="create" redirectPath="/admin/events" />
    </div>
  );
}
