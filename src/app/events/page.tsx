import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { EventSearch } from "@/components/event-search";
import { AreaPills } from "@/components/area-pills";
import { CategoryPills } from "@/components/category-pills";
import type { EventItem } from "@/types/database";
import { 
  Filter, 
  MapPin, 
  Tag, 
  RotateCcw, 
  Sparkles,
  Ticket,
  SlidersHorizontal
} from "lucide-react";

import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    area?: string;
    date?: string;
    price?: string;
    featured?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const area = params.area || "";
  const dateFilter = params.date || "all";
  const priceFilter = params.price || "all";
  const featuredOnly = params.featured === "true";

  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "approved");

  if (category && category !== "All") {
    query = query.ilike("category", `%${category}%`);
  }

  if (area && area !== "All") {
    query = query.ilike("city_area", `%${area}%`);
  }

  if (priceFilter && priceFilter !== "all") {
    query = query.eq("price_type", priceFilter);
  }

  if (featuredOnly) {
    query = query.eq("featured", true);
  }

  if (q.trim()) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,venue_name.ilike.%${q}%,city_area.ilike.%${q}%`);
  }

  // Order chronologically
  query = query.order("date_start", { ascending: true });

  const { data: rawEvents } = await query;
  let events = (rawEvents as EventItem[]) || [];

  // Date filtering in memory for precise local timezone handling
  const now = new Date();
  if (dateFilter === "today") {
    events = events.filter((e) => {
      const d = new Date(e.date_start);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
  } else if (dateFilter === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    events = events.filter((e) => {
      const d = new Date(e.date_start);
      return (
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear()
      );
    });
  } else if (dateFilter === "weekend") {
    // Next 7 days
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    events = events.filter((e) => {
      const d = new Date(e.date_start);
      return d >= now && d <= nextWeek;
    });
  } else if (dateFilter === "month") {
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    events = events.filter((e) => {
      const d = new Date(e.date_start);
      return d >= now && d <= nextMonth;
    });
  }

  const hasActiveFilters = Boolean(
    q || (category && category !== "All") || (area && area !== "All") || dateFilter !== "all" || priceFilter !== "all" || featuredOnly
  );

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Discover Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Events in Lahore
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            Browse verified upcoming gatherings, conferences, workshops, concerts, and festivals. Click register to book on the official source.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl">
          <Suspense fallback={<div className="h-14 bg-slate-900/80 rounded-2xl animate-pulse" />}>
            <EventSearch placeholder="Search by event name, venue, locality, or keyword..." />
          </Suspense>
        </div>

        {/* Filter Controls Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              Filter by Locality & Category
            </div>

            {hasActiveFilters && (
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </Link>
            )}
          </div>

          {/* Lahore Area Filter */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Lahore Area:
            </div>
            <Suspense fallback={<div className="h-10 bg-slate-900/60 rounded-xl animate-pulse" />}>
              <AreaPills currentArea={area} />
            </Suspense>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-orange-400" />
              Category:
            </div>
            <Suspense fallback={<div className="h-16 bg-slate-900/60 rounded-2xl animate-pulse" />}>
              <CategoryPills currentCategory={category} />
            </Suspense>
          </div>

          {/* Date & Price Filter Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Date filter */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Date Horizon:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All Upcoming", value: "all" },
                  { label: "Today", value: "today" },
                  { label: "Tomorrow", value: "tomorrow" },
                  { label: "Next 7 Days", value: "weekend" },
                  { label: "Next 30 Days", value: "month" },
                ].map((item) => {
                  const isActive = dateFilter === item.value;
                  const newParams = new URLSearchParams(params as Record<string, string>);
                  if (item.value === "all") {
                    newParams.delete("date");
                  } else {
                    newParams.set("date", item.value);
                  }
                  return (
                    <Link
                      key={item.value}
                      href={`/events?${newParams.toString()}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isActive
                          ? "bg-orange-600 text-white border-orange-500 shadow-sm"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Price filter */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admission:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All Events", value: "all" },
                  { label: "Free Admission", value: "free" },
                  { label: "Paid / Ticketed", value: "paid" },
                ].map((item) => {
                  const isActive = priceFilter === item.value;
                  const newParams = new URLSearchParams(params as Record<string, string>);
                  if (item.value === "all") {
                    newParams.delete("price");
                  } else {
                    newParams.set("price", item.value);
                  }
                  return (
                    <Link
                      key={item.value}
                      href={`/events?${newParams.toString()}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isActive
                          ? "bg-orange-600 text-white border-orange-500 shadow-sm"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count & Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>
              Showing <span className="text-white font-black">{events.length}</span> verified events in Lahore
            </span>
            {hasActiveFilters && (
              <span className="text-orange-400">Filtered results active</span>
            )}
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No matching events found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                We couldn't find any events matching your selected filters. Try changing your search keywords or resetting filters.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/events"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                >
                  Clear All Filters
                </Link>
                <Link
                  href="/submit-event"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-500"
                >
                  Post This Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
