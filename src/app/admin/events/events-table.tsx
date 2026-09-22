"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { EventItem, EventStatus } from "@/types/database";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Archive,
  RotateCcw,
  Pencil,
  Filter,
  Loader2
} from "lucide-react";

interface EventsTableProps {
  initialEvents: EventItem[];
}

export function EventsTable({ initialEvents }: EventsTableProps) {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.venue_name.toLowerCase().includes(search.toLowerCase()) ||
      event.city_area.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleFeatured = async (event: EventItem) => {
    try {
      const supabase = createClient();
      const nextFeatured = !event.featured;
      const { error } = await supabase
        .from("events")
        .update({ featured: nextFeatured })
        .eq("id", event.id);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, featured: nextFeatured } : e))
      );
      toast.success(
        `"${event.title}" is ${nextFeatured ? "now featured" : "removed from featured"}`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update featured status");
    }
  };

  const handleArchiveToggle = async (event: EventItem) => {
    const isCurrentlyArchived = event.status === "archived";
    const nextStatus: EventStatus = isCurrentlyArchived ? "approved" : "archived";

    setArchivingId(event.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: nextStatus } : e))
      );

      if (nextStatus === "archived") {
        toast.info(`"${event.title}" has been archived and hidden from public searches.`);
      } else {
        toast.success(`"${event.title}" restored and published as approved.`);
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to change archive status");
    } finally {
      setArchivingId(null);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${event.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(event.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("events").delete().eq("id", event.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success(`"${event.title}" was permanently deleted.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-[#111111]">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter events by title, venue, or locality..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-xs text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#9CA3AF]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-xs font-medium text-[#111111] focus:border-[#2563EB] focus:outline-none"
          >
            <option value="all">All Statuses ({events.length})</option>
            <option value="approved">Approved Only ({events.filter(e => e.status === "approved").length})</option>
            <option value="pending">Pending Only ({events.filter(e => e.status === "pending").length})</option>
            <option value="archived">Archived Only ({events.filter(e => e.status === "archived").length})</option>
            <option value="rejected">Rejected Only ({events.filter(e => e.status === "rejected").length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Event Details</th>
                <th className="p-4">Date & Venue</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F3F4F6] shrink-0 border border-[#E5E7EB]">
                        {evt.image_url ? (
                          <Image
                            src={evt.image_url}
                            alt={evt.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-[#9CA3AF]">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 max-w-xs">
                        <span className="font-bold text-xs text-[#111111] line-clamp-1">
                          {evt.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                          <span className="font-mono">{evt.category}</span>
                          {evt.organizer?.email && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[120px]" title={evt.organizer.email}>
                                {evt.organizer.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-[#4B5563]">
                    <div className="space-y-0.5">
                      <div className="font-medium text-[#111111]">
                        {formatEventDate(evt.date_start)}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        {evt.venue_name} ({evt.city_area})
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-medium text-[#111111]">
                    {formatPrice(evt.price_type, evt.price_amount)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : evt.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : evt.status === "archived"
                          ? "bg-slate-100 text-slate-700 border border-slate-300"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {evt.status === "approved" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {evt.status === "pending" && <Clock className="w-3 h-3 text-amber-600" />}
                      {evt.status === "archived" && <Archive className="w-3 h-3 text-slate-600" />}
                      {evt.status === "rejected" && <XCircle className="w-3 h-3 text-rose-600" />}
                      {evt.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(evt)}
                      className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 border transition-colors ${
                        evt.featured
                          ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                          : "bg-[#FAFAF8] text-[#6B7280] border-[#E5E7EB] hover:border-[#D1D5DB]"
                      }`}
                    >
                      <Sparkles className={`w-3 h-3 ${evt.featured ? "text-amber-600" : "text-[#9CA3AF]"}`} />
                      <span>{evt.featured ? "Featured" : "Standard"}</span>
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Link */}
                      <Link
                        href={`/events/${evt.slug}`}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6]"
                        title="View Public Event Preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Edit Button */}
                      <Link
                        href={`/admin/events/${evt.id}/edit`}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Edit Event Details"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>

                      {/* Archive / Unarchive Button */}
                      <button
                        type="button"
                        onClick={() => handleArchiveToggle(evt)}
                        disabled={archivingId === evt.id}
                        className={`p-1.5 rounded-lg transition-colors ${
                          evt.status === "archived"
                            ? "text-emerald-700 hover:bg-emerald-50"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        title={evt.status === "archived" ? "Unarchive / Restore Event" : "Archive Event (Hide from Public)"}
                      >
                        {archivingId === evt.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : evt.status === "archived" ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(evt)}
                        disabled={deletingId === evt.id}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        title="Delete Event Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6B7280]">
                    No events match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
