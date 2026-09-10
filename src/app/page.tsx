import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { EventSearch } from "@/components/event-search";
import { AreaPills } from "@/components/area-pills";
import { CategoryPills } from "@/components/category-pills";
import type { EventItem, SiteSettings } from "@/types/database";
import { 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  PlusCircle,
  Flame
} from "lucide-react";

import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Fresh data for site copy & events

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch site settings for dynamic copy customization
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const settings: SiteSettings = settingsData || {
    id: 1,
    hero_heading: "Discover Lahore's Most Exciting Events",
    hero_description:
      "From tech summits and startup demos to live concerts, street food carnivals, and cultural festivals across Lahore.",
    hero_cta_text: "Explore Events",
    announcement_text:
      "🔥 Live in Lahore: Discover verified upcoming events across Gulberg, DHA, Johar Town & more!",
    banner_active: true,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };

  // 2. Fetch featured events
  const { data: featuredEvents } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .eq("featured", true)
    .order("date_start", { ascending: true })
    .limit(3);

  // 3. Fetch upcoming approved events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .order("date_start", { ascending: true })
    .limit(8);

  const featuredList = (featuredEvents as EventItem[]) || [];
  const upcomingList = (upcomingEvents as EventItem[]) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Announcement Banner */}
      {settings.banner_active && settings.announcement_text && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide shadow-inner flex items-center justify-center gap-2">
          <Flame className="w-4 h-4 text-amber-200 fill-amber-200 shrink-0" />
          <span>{settings.announcement_text}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-600/20 via-amber-500/10 to-indigo-600/20 blur-[130px] -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Locality Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-orange-500/40 text-orange-400 text-xs sm:text-sm font-black tracking-wide shadow-md">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>GULBERG • DHA • JOHAR TOWN • WALLED CITY</span>
          </div>

          {/* Dynamic Hero Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
              {settings.hero_heading}
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              {settings.hero_description}
            </p>
          </div>

          {/* High-Contrast Search Form */}
          <div className="max-w-2xl mx-auto pt-2">
            <Suspense fallback={<div className="h-14 bg-slate-900/80 rounded-2xl animate-pulse" />}>
              <EventSearch />
            </Suspense>
          </div>

          {/* Area Quick Filter Pills */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left sm:text-center">
              Browse by Lahore Area:
            </div>
            <Suspense fallback={<div className="h-10 bg-slate-900/60 rounded-xl animate-pulse" />}>
              <AreaPills className="justify-start sm:justify-center" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 border-y border-slate-800/80 bg-[#090d18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Explore Categories
              </h2>
              <p className="text-xs text-slate-400">Discover events that match your passion in Lahore</p>
            </div>
            <Link
              href="/events"
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group"
            >
              View All Events
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <Suspense fallback={<div className="h-16 bg-slate-900/60 rounded-2xl animate-pulse" />}>
            <CategoryPills />
          </Suspense>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredList.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Staff Picks
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Featured Lahore Events
                </h2>
                <p className="text-sm text-slate-400">Hand-curated, high-impact conferences, galas, and concerts</p>
              </div>

              <Link
                href="/events?featured=true"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700/80 hover:border-slate-500 hover:text-white transition-colors"
              >
                <span>See all featured</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredList.map((event, idx) => (
                <EventCard key={event.id} event={event} priority={idx === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      <section className="py-16 bg-[#070a12] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                Schedule
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Upcoming in Lahore
              </h2>
              <p className="text-sm text-slate-400">Chronological calendar of verified events across all venues</p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <span>{settings.hero_cta_text}</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingList.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {upcomingList.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <p className="text-slate-400">No events found matching current criteria.</p>
              <Link
                href="/submit-event"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-orange-600"
              >
                Be the first to post an event!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Bold Organizer CTA Banner */}
      <section className="py-20 bg-gradient-to-b from-[#090d18] to-[#070a12] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-orange-950/50 via-slate-900 to-indigo-950/50 border-2 border-orange-500/30 overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-600 text-white text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                For Organizers & Creators
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Organizing an Event in Lahore?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Reach thousands of Lahoris looking for events. Simply submit your event details and your external registration link (Google Form, Ticketwala, Eventbrite, or custom site). Our admin team approves verified events quickly.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/submit-event"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 transition-all active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  Post Event for Free
                </Link>

                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 transition-colors"
                >
                  Browse Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
