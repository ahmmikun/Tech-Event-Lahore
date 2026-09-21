import Link from "next/link";
import Image from "next/image";
import { 
  MapPin, 
  ExternalLink, 
  Tag, 
  Sparkles,
  Ticket
} from "lucide-react";
import type { EventItem } from "@/types/database";
import { formatEventShortDate, formatPrice } from "@/lib/utils";

interface EventCardProps {
  event: EventItem;
  priority?: boolean;
}

export function EventCard({ event, priority = false }: EventCardProps) {
  const dateInfo = formatEventShortDate(event.date_start);
  const fallbackImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";
  const imageUrl = event.image_url || fallbackImage;

  return (
    <div className="rounded-xl overflow-hidden flex flex-col group h-full relative border border-[#E5E7EB] bg-white shadow-sm hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Top Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F3F4F6]">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-103"
        />

        {/* Floating Date Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-[#E5E7EB] rounded-lg px-2.5 py-1 flex flex-col items-center shadow-sm">
          <span className="text-[9px] font-bold text-[#2563EB] tracking-wider font-mono uppercase">
            {dateInfo.month}
          </span>
          <span className="text-base font-black text-[#111111] leading-none">
            {dateInfo.day}
          </span>
        </div>

        {/* Featured Ribbon */}
        {event.featured && (
          <div className="absolute top-3 right-3 bg-[#F4B942] text-[#111111] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#111111]" />
            Featured
          </div>
        )}

        {/* Category & Price Tags on Image Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-white/95 text-[#111111] border border-[#E5E7EB] shadow-sm">
            <Tag className="w-3 h-3 text-[#2563EB]" />
            {event.category}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm ${
              event.price_type === "free"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            <Ticket className="w-3 h-3" />
            {formatPrice(event.price_type, event.price_amount)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Locality & Time */}
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="flex items-center gap-1 text-[#111111] font-semibold truncate">
              <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
              {event.city_area}
            </span>
            {event.time_display && (
              <span className="text-[11px] text-[#6B7280] shrink-0 font-mono">
                {event.time_display.split("-")[0]}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/events/${event.slug}`} className="block group-hover:text-[#2563EB] transition-colors">
            <h3 className="font-extrabold text-base sm:text-lg text-[#111111] leading-snug line-clamp-2">
              {event.title}
            </h3>
          </Link>

          {/* Venue & Short description */}
          <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
            {event.short_description || event.description}
          </p>

          <p className="text-[11px] text-[#6B7280] truncate flex items-center gap-1 pt-1 font-mono">
            <span>Venue:</span>
            <span className="text-[#111111] font-sans font-medium">{event.venue_name}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#F3F4F6] flex items-center gap-2">
          <Link
            href={`/events/${event.slug}`}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-[#374151] bg-[#F3F4F6] hover:bg-[#E5E7EB] hover:text-[#111111] transition-colors text-center"
          >
            Details
          </Link>

          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-all text-center group/btn active:scale-98"
          >
            <span>Register</span>
            <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
