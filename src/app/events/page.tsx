import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { EventSearch } from "@/components/event-search";
import { AreaPills } from "@/components/area-pills";
import { CategoryPills } from "@/components/category-pills";
import type { EventItem } from "@/types/database";
import { DEFAULT_LAHORE_TECH_EVENTS } from "@/lib/mock-events";
import { 
  Filter, 
  MapPin, 
  Tag, 
  RotateCcw, 
  Terminal,
  SlidersHorizontal,
  PlusCircle
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

  query = query.order("date_start", { ascending: true });

  let events: EventItem[] = [];
  try {
    const { data: rawEvents } = await query;
    if (rawEvents && rawEvents.length > 0) {
      events = rawEvents as EventItem[];
    }
  } catch {
    // Graceful fallback to local tech events
  }

  // If Supabase table is unseeded, use mock events and apply identical filter logic
  if (events.length === 0) {
    events = DEFAULT_LAHORE_TECH_EVENTS.filter((e) => {
      if (featuredOnly && !e.featured) return false;
      if (priceFilter && priceFilter !== "all" && e.price_type !== priceFilter) return false;
      if (category && category !== "All" && !e.category.toLowerCase().includes(category.toLowerCase())) return false;
      if (area && area !== "All" && !e.city_area.toLowerCase().includes(area.toLowerCase())) return false;
      if (q.trim()) {
        const queryLower = q.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(queryLower);
        const matchDesc = e.description.toLowerCase().includes(queryLower);
        const matchVenue = e.venue_name.toLowerCase().includes(queryLower);
        const matchArea = e.city_area.toLowerCase().includes(queryLower);
        if (!matchTitle && !matchDesc && !matchVenue && !matchArea) return false;
      }
      return true;
    });
  }

  // Date horizon filtering
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
    <div className="min-h-screen py-10 bg-[#FAFAF8] text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-[#E5E7EB] text-[#111111] text-xs font-mono tracking-wider shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
            LAHORE TECH DIRECTORY
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Events in Lahore
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-2xl leading-relaxed">
            Discover verified tech summits, hackathons, open source workshops, and founder meetups across Lahore&apos;s tech hubs.
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-3xl">
          <Suspense fallback={<div className="h-12 bg-white rounded-xl border border-[#E5E7EB] animate-pulse" />}>
            <EventSearch placeholder="Search by tech stack, event name, venue, or locality..." />
          </Suspense>
        </div>

        {/* Filter Controls Card - Light Neo-Brutalism */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
              Filter Discovery
            </div>

            {hasActiveFilters && (
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </Link>
            )}
          </div>

          {/* Lahore Area Filter */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              Lahore Area:
            </div>
            <Suspense fallback={<div className="h-9 bg-[#FAFAF8] rounded-lg animate-pulse" />}>
              <AreaPills currentArea={area} />
            </Suspense>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
              Tech Category:
            </div>
            <Suspense fallback={<div className="h-10 bg-[#FAFAF8] rounded-lg animate-pulse" />}>
              <CategoryPills currentCategory={category} />
            </Suspense>
          </div>

          {/* Date & Price Filter Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F3F4F6]">
            {/* Date filter */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-[#6B7280] uppercase tracking-wider">
                Date Horizon:
              </div>
              <div className="flex flex-wrap gap-1.5">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        isActive
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB]"
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
              <div className="text-xs font-mono font-semibold text-[#6B7280] uppercase tracking-wider">
                Admission:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "All Events", value: "all" },
                  { label: "Free Entry", value: "free" },
                  { label: "Ticketed", value: "paid" },
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        isActive
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB]"
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

        {/* Results Counter & Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-medium text-[#6B7280]">
            <span>
              Showing <span className="text-[#111111] font-bold">{events.length}</span> verified tech events in Lahore
            </span>
            {hasActiveFilters && (
              <span className="text-[#2563EB] font-medium">Filtered results</span>
            )}
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-white border border-[#E5E7EB] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center mx-auto text-[#6B7280]">
                <Filter className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">No matching tech events found</h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                No events currently match your selected filters. Try changing your search keywords or resetting the filters.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/events"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#F3F4F6] text-[#111111] hover:bg-[#E5E7EB]"
                >
                  Clear All Filters
                </Link>
                <Link
                  href="/submit-event"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#111111] text-white hover:bg-[#2563EB]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Post an Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
