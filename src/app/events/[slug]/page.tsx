import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventActions } from "@/components/event-actions";
import { EventCard } from "@/components/event-card";
import type { EventItem } from "@/types/database";
import { DEFAULT_LAHORE_TECH_EVENTS } from "@/lib/mock-events";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  ArrowLeft,
  Navigation,
  CheckCircle2,
  Terminal,
  User,
  Building2,
  Video,
  Globe
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

  let event: Partial<EventItem> | null = null;
  try {
    const { data } = await supabase
      .from("events")
      .select("title, short_description, description, image_url, city_area, category")
      .eq("slug", slug)
      .single();
    if (data) {
      event = data;
    }
  } catch {
    // Fallback
  }

  if (!event) {
    event = DEFAULT_LAHORE_TECH_EVENTS.find((e) => e.slug === slug) || null;
  }

  if (!event || !event.title) {
    return {
      title: "Event Not Found | Lahore Tech Events",
    };
  }

  const title = `${event.title} in ${event.city_area || "Lahore"}`;
  const description = event.short_description || event.description?.slice(0, 160) || "";

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

  let event: EventItem | null = null;
  try {
    const { data: eventData } = await supabase
      .from("events")
      .select("*, organizer:organizer_id(id, full_name, email, avatar_url)")
      .eq("slug", slug)
      .single();

    if (eventData) {
      event = eventData as EventItem;
    }
  } catch {
    // Fallback
  }

  if (!event) {
    event = DEFAULT_LAHORE_TECH_EVENTS.find((e) => e.slug === slug) || null;
  }

  if (!event) {
    notFound();
  }

  const fallbackImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
  const posterUrl = event.image_url || fallbackImage;

  // Fetch related events
  let relatedEvents: EventItem[] = [];
  try {
    const { data: relatedData } = await supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .neq("id", event.id)
      .or(`category.eq."${event.category}",city_area.eq."${event.city_area}"`)
      .limit(3);

    if (relatedData && relatedData.length > 0) {
      relatedEvents = relatedData as EventItem[];
    }
  } catch {
    // Fallback
  }

  if (relatedEvents.length === 0) {
    relatedEvents = DEFAULT_LAHORE_TECH_EVENTS.filter((e) => e.id !== event?.id).slice(0, 3);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date_start,
    endDate: event.date_end || event.date_start,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.venue_type === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.venue_type === "hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
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
      name:
        event.organization_name ||
        event.organizer_name ||
        event.organizer?.full_name ||
        "Lahore Tech Community",
    },
  };

  const isVirtualOrTbd =
    event.venue_type === "online" ||
    event.venue_name?.toLowerCase().includes("announced") ||
    event.venue_name?.toLowerCase().includes("check");

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue_name}, ${event.venue_address}, Lahore`
  )}`;

  return (
    <div className="min-h-screen pb-24 bg-[#FAFAF8] text-[#111111]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all tech events
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Title & Metadata Line */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#111111] text-white text-xs font-mono font-bold uppercase tracking-wider">
              <Terminal className="w-3 h-3" />
              {event.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-[#4B5563] text-xs font-medium">
              <MapPin className="w-3 h-3 text-[#2563EB]" />
              {event.city_area}, Lahore
            </span>
            {event.venue_type === "online" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold font-mono">
                <Video className="w-3 h-3 text-purple-600" />
                Online / Virtual
              </span>
            ) : event.venue_type === "hybrid" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold font-mono">
                <Globe className="w-3 h-3 text-emerald-600" />
                Hybrid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold font-mono">
                <MapPin className="w-3 h-3 text-[#2563EB]" />
                Onsite
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.08]">
            {event.title}
          </h1>

          {/* Editorial Metadata Strip: Date · Time · Venue · Organization */}
          <div className="text-xs sm:text-sm text-[#6B7280] font-mono flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[#111111] font-semibold">{formatEventDate(event.date_start)}</span>
            <span>·</span>
            <span>{event.time_display || "Time TBD"}</span>
            <span>·</span>
            <span>{event.venue_name}</span>
            {event.organization_name && (
              <>
                <span>·</span>
                <span className="text-[#2563EB] font-bold">By {event.organization_name}</span>
              </>
            )}
          </div>
        </div>

        {/* 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Media & Narrative (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Media Banner */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shadow-sm">
              <Image
                src={posterUrl}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />

              {event.status !== "approved" && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-[#F4B942] text-[#111111] shadow-sm">
                  Status: {event.status}
                </div>
              )}
            </div>

            {/* Event Highlights Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#2563EB] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">
                    Date & Time
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#111111]">
                    {formatEventDate(event.date_start)}
                  </div>
                  {event.time_display && (
                    <div className="text-xs text-[#2563EB] font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {event.time_display}
                    </div>
                  )}
                </div>
              </div>

              {/* Venue & Location */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#2563EB] shrink-0">
                  {event.venue_type === "online" ? (
                    <Video className="w-4 h-4 text-purple-600" />
                  ) : event.venue_type === "hybrid" ? (
                    <Globe className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">
                      Venue & Location
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563]">
                      {event.venue_type || "onsite"}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#111111]">
                    {event.venue_name}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
                    {event.venue_address}
                  </div>
                  {isVirtualOrTbd ? (
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline mt-1"
                    >
                      <Navigation className="w-3 h-3" />
                      View Location on Official Event Link ↗
                    </a>
                  ) : (
                    <a
                      href={googleMapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline mt-1"
                    >
                      <Navigation className="w-3 h-3" />
                      Open in Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Comprehensive Description */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] tracking-tight">
                About This Event
              </h2>
              <div className="text-xs sm:text-sm text-[#374151] leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono font-semibold text-[#6B7280] uppercase tracking-wider">
                  Tags & Topics
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-[#4B5563] border border-[#E5E7EB]"
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
            <div className="sticky top-28 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-md space-y-6">
              {/* Price & Admission */}
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">
                    Admission Fee
                  </div>
                  <div className="text-2xl font-black text-[#111111]">
                    {formatPrice(event.price_type, event.price_amount)}
                  </div>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    event.price_type === "free"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {event.price_type === "free" ? "Free Pass" : "Paid Pass"}
                </div>
              </div>

              {/* Action Buttons with External Redirect */}
              <EventActions event={event} />

              {/* Organizer & Host Card */}
              {(event.organization_name || event.organizer_name || event.organizer) && (
                <div className="pt-4 border-t border-[#F3F4F6] space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">
                    Organized & Hosted by:
                  </div>

                  {/* Organization / Community */}
                  {event.organization_name && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#111111] leading-tight">
                          {event.organization_name}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">
                          Host Organization / Community
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Lead Organizer */}
                  {event.organizer_name && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#4B5563] shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#111111] leading-tight">
                          {event.organizer_name}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">
                          Lead Organizer / POC
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fallback to user account if neither is explicitly specified */}
                  {!event.organization_name && !event.organizer_name && event.organizer && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-bold text-xs text-[#111111]">
                        {event.organizer.avatar_url ? (
                          <img
                            src={event.organizer.avatar_url}
                            alt="Organizer"
                            className="w-full h-full rounded-md object-cover"
                          />
                        ) : (
                          event.organizer.email[0].toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#111111]">
                          {event.organizer.full_name || event.organizer.email.split("@")[0]}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">
                          Verified Community Host
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Community Notice */}
              <div className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[11px] text-[#6B7280] leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                <span>
                  Lahore Tech Events connects developers directly with verified event organizers. Registration is handled securely on the organizer&apos;s external form or ticket portal.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="pt-16 border-t border-[#E5E7EB] space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                More Tech Events in Lahore
              </h2>
              <p className="text-xs text-[#6B7280]">
                Similar upcoming gatherings in {event.category} or nearby {event.city_area}
              </p>
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
