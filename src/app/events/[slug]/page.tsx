import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventActions } from "@/components/event-actions";
import { EventCard } from "@/components/event-card";
import type { EventItem } from "@/types/database";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Tag, 
  Ticket, 
  Sparkles, 
  ArrowLeft,
  Share2,
  Navigation
} from "lucide-react";

export const revalidate = 0;

interface EventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, short_description, description, image_url, city_area, category")
    .eq("slug", slug)
    .single();

  if (!event) {
    return {
      title: "Event Not Found | Event Finder Lahore",
    };
  }

  const title = `${event.title} in ${event.city_area}, Lahore`;
  const description = event.short_description || event.description.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.image_url ? [{ url: event.image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.image_url ? [event.image_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch event details with organizer
  const { data: eventData } = await supabase
    .from("events")
    .select("*, organizer:organizer_id(id, full_name, email, avatar_url)")
    .eq("slug", slug)
    .single();

  if (!eventData) {
    notFound();
  }

  const event = eventData as EventItem;
  const fallbackImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
  const posterUrl = event.image_url || fallbackImage;

  // Fetch related events in same category or area
  const { data: relatedData } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .neq("id", event.id)
    .or(`category.eq."${event.category}",city_area.eq."${event.city_area}"`)
    .limit(3);

  const relatedEvents = (relatedData as EventItem[]) || [];

  // JSON-LD structured data for Google Event indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date_start,
    endDate: event.date_end || event.date_start,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue_name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue_address,
        addressLocality: event.city_area,
        addressRegion: "Punjab",
        addressCountry: "PK",
      },
    },
    image: [posterUrl],
    offers: {
      "@type": "Offer",
      url: event.registration_url,
      price: event.price_amount,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer?.full_name || "Lahore Event Organizer",
    },
  };

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue_name}, ${event.venue_address}, Lahore`
  )}`;

  return (
    <div className="min-h-screen pb-20">
      {/* JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          Back to all events
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Grid: Left Details & Right Sticky Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Media & Full Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image Banner */}
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <Image
                src={posterUrl}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-transparent to-transparent" />

              {/* Status pill if not approved (for organizer preview) */}
              {event.status !== "approved" && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-600 text-white shadow-lg">
                  Status: {event.status}
                </div>
              )}

              {/* Category & Locality Badges */}
              <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900/90 text-orange-400 border border-orange-500/40 backdrop-blur-md">
                  <Tag className="w-3.5 h-3.5" />
                  {event.category}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900/90 text-slate-200 border border-slate-700/60 backdrop-blur-md">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  {event.city_area}, Lahore
                </span>
              </div>
            </div>

            {/* Event Header Information */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              {event.short_description && (
                <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
                  {event.short_description}
                </p>
              )}

              {/* Key metadata chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-y border-slate-800 py-6">
                {/* Date & Time */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Date & Time
                    </div>
                    <div className="text-sm font-black text-white">
                      {formatEventDate(event.date_start)}
                    </div>
                    {event.time_display && (
                      <div className="text-xs text-orange-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {event.time_display}
                      </div>
                    )}
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Venue Location
                    </div>
                    <div className="text-sm font-black text-white">
                      {event.venue_name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {event.venue_address}
                    </div>
                    <a
                      href={googleMapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-orange-300 mt-1"
                    >
                      <Navigation className="w-3 h-3" />
                      Open in Google Maps ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                About This Event
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-base">
                {event.description}
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="space-y-2 pt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Event Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Action & Ticket Registration Card (1 Col) */}
          <div className="space-y-6">
            <div className="sticky top-28 p-6 rounded-3xl bg-[#0e1424] border-2 border-orange-500/30 shadow-2xl space-y-6">
              {/* Price Display */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Registration Fee
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {formatPrice(event.price_type, event.price_amount)}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    event.price_type === "free"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                      : "bg-indigo-950 text-indigo-400 border border-indigo-500/30"
                  }`}
                >
                  {event.price_type === "free" ? "Free Pass" : "Ticketed"}
                </div>
              </div>

              {/* Action Buttons with External Redirect */}
              <EventActions event={event} />

              {/* Organizer Profile Card */}
              {event.organizer && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Organized by:
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-white">
                      {event.organizer.avatar_url ? (
                        <img
                          src={event.organizer.avatar_url}
                          alt="Organizer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        event.organizer.email[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {event.organizer.full_name || event.organizer.email.split("@")[0]}
                      </span>
                      <span className="text-xs text-slate-400">
                        Lahore Event Host
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-bold text-orange-400">Notice:</span> Event Finder Lahore connects attendees with verified local events. Registration and payments are handled securely on the host's external website.
              </div>
            </div>
          </div>
        </div>

        {/* Related Events Carousel / Grid */}
        {relatedEvents.length > 0 && (
          <div className="pt-16 border-t border-slate-800 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                More Events in Lahore
              </h2>
              <p className="text-xs text-slate-400">Similar events in {event.category} or {event.city_area}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((rel) => (
                <EventCard key={rel.id} event={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
