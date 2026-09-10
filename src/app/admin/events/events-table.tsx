"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { EventItem } from "@/types/database";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Filter
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

  const handleDelete = async (event: EventItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${event.title}"?`)) {
      return;
    }

    setDeletingId(event.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("events").delete().eq("id", event.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success(`"${event.title}" was deleted.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1424] border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter events by title, venue, or locality..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "approved", "pending", "rejected"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-orange-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table Container */}
      <div className="rounded-3xl bg-[#0e1424] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="p-4">Event</th>
                <th className="p-4">Date & Locality</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-900/40 transition-colors">
                  {/* Event Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                        <Image
                          src={
                            event.image_url ||
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80"
                          }
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-white max-w-xs truncate">
                          {event.title}
                        </div>
                        <div className="text-[11px] text-orange-400 font-semibold">
                          {event.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date & Area */}
                  <td className="p-4 space-y-0.5">
                    <div className="font-semibold text-slate-200">
                      {formatEventDate(event.date_start)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {event.city_area} ({event.venue_name})
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {formatPrice(event.price_type, event.price_amount)}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {event.status === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {event.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {event.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-300 border border-red-500/30">
                        <XCircle className="w-3 h-3" /> Declined
                      </span>
                    )}
                  </td>

                  {/* Featured Toggle */}
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(event)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                        event.featured
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {event.featured ? "Featured" : "Regular"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/events/${event.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-700"
                        title="View Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-500/30"
                        title="Test Registration Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(event)}
                        disabled={deletingId === event.id}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-950/40 border border-red-500/30"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No events found matching current criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
