import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { EventSearch } from "@/components/event-search";
import { AreaPills } from "@/components/area-pills";
import { CategoryPills } from "@/components/category-pills";
import type { EventItem, SiteSettings } from "@/types/database";
import { DEFAULT_LAHORE_TECH_EVENTS } from "@/lib/mock-events";
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Terminal, 
  PlusCircle,
  Sparkles,
  Flame
} from "lucide-react";

import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch dynamic site settings
  let settings: SiteSettings = {
    id: 1,
    hero_heading: "Discover what's happening in Lahore's tech scene.",
    hero_description:
      "The definitive discovery platform for Lahore's tech community. Find hackathons, developer meetups, AI workshops, startup demos, and tech conferences across the city.",
    hero_cta_text: "Explore Events",
    announcement_text:
      "⚡ Live in Lahore: Discover verified upcoming tech conferences, hackathons & developer meetups!",
    banner_active: true,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };

  try {
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (settingsData) {
      settings = settingsData;
    }
  } catch {
    // Graceful fallback
  }

  // 2. Fetch featured events
  let featuredList: EventItem[] = [];
  try {
    const { data: featuredEvents } = await supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .eq("featured", true)
      .order("date_start", { ascending: true })
      .limit(6);

    if (featuredEvents && featuredEvents.length > 0) {
      featuredList = featuredEvents as EventItem[];
    }
  } catch {
    // Graceful fallback
  }

  // 3. Fetch upcoming approved events
  let upcomingList: EventItem[] = [];
  try {
    const { data: upcomingEvents } = await supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .order("date_start", { ascending: true })
      .limit(8);

    if (upcomingEvents && upcomingEvents.length > 0) {
      upcomingList = upcomingEvents as EventItem[];
    }
  } catch {
    // Graceful fallback
  }

  // Fallbacks if database is empty so visitors experience a populated, live platform
  if (featuredList.length === 0) {
    featuredList = DEFAULT_LAHORE_TECH_EVENTS.filter((e) => e.featured).slice(0, 3);
  }
  if (upcomingList.length === 0) {
    upcomingList = DEFAULT_LAHORE_TECH_EVENTS;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8] text-[#111111]">
      {/* Announcement Strip */}
      {settings.banner_active && settings.announcement_text && (
        <div className="bg-[#111111] text-white py-2 px-4 text-center text-xs font-mono font-medium tracking-wide flex items-center justify-center gap-2 border-b border-[#E5E7EB]">
          <Flame className="w-3.5 h-3.5 text-[#F4B942] shrink-0" />
          <span>{settings.announcement_text}</span>
        </div>
      )}

      {/* Hero Section - Light Editorial */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#E5E7EB] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            {/* Location Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-[#E5E7EB] text-[#111111] text-xs font-mono tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <MapPin className="w-3 h-3 text-[#2563EB]" />
              <span>LAHORE, PAKISTAN · 31.5204° N</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#111111] leading-[1.05]">
              {settings.hero_heading}
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-xl text-[#4B5563] max-w-2xl font-normal leading-relaxed">
              {settings.hero_description}
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-colors active:scale-98"
              >
                <span>{settings.hero_cta_text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/submit-event"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-xs sm:text-sm text-[#111111] bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] shadow-sm transition-colors active:scale-98"
              >
                <PlusCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Submit Event</span>
              </Link>
            </div>

            {/* Search Bar in Hero */}
            <div className="pt-4 max-w-2xl">
              <Suspense fallback={<div className="h-12 bg-white rounded-xl border border-[#E5E7EB] animate-pulse" />}>
                <EventSearch placeholder="Search events, venues, tech stacks in Lahore..." />
              </Suspense>
            </div>

            {/* Quick Area Filter Chips */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs font-mono text-[#6B7280] uppercase tracking-wider shrink-0">
                Key Areas:
              </span>
              <Suspense fallback={<div className="h-8 bg-white rounded-lg animate-pulse w-48" />}>
                <AreaPills className="justify-start" />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Category Discovery Strip */}
      <section className="py-6 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Popular Tech Domains
              </h2>
            </div>
            <Link
              href="/events"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 group"
            >
              Browse all categories
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <Suspense fallback={<div className="h-10 bg-[#FAFAF8] rounded-lg animate-pulse" />}>
            <CategoryPills />
          </Suspense>
        </div>
      </section>

      {/* Featured Tech Events - Simple Grid */}
      {featuredList.length > 0 && (
        <section className="py-16 md:py-20 border-b border-[#E5E7EB] bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-[#2563EB]" />
                  Curated Highlights
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                  Featured Tech Events
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  Hand-curated, high-impact conferences, hackathons, and dev gatherings across Lahore
                </p>
              </div>

              <Link
                href="/events?featured=true"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#111111] hover:text-[#2563EB] transition-colors"
              >
                <span>See all featured</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Simple Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredList.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Calendar Section - Simple Grid */}
      <section className="py-16 md:py-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3F4F6] text-[#4B5563] text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3 h-3 text-[#2563EB]" />
                Schedule
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                Upcoming in Lahore
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Chronological calendar of verified tech gatherings, hackathons, and workshops
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-white bg-[#111111] hover:bg-[#2563EB] transition-colors shadow-sm"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingList.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Organizer Call-To-Action Banner */}
      <section className="py-16 md:py-20 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider">
                For Organizers & Communities
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                Hosting a Tech Event or Meetup in Lahore?
              </h2>

              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Connect with thousands of software engineers, university builders, and tech professionals across Lahore. Submissions are free and include direct external registration links.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                href="/submit-event"
                className="w-full sm:w-auto text-center px-5 py-3 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-colors active:scale-98"
              >
                Post Event for Free
              </Link>
              <Link
                href="/events"
                className="w-full sm:w-auto text-center px-4 py-3 rounded-lg font-bold text-xs sm:text-sm text-[#111111] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
              >
                Browse Directory
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
