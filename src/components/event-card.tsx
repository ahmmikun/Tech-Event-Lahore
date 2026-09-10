import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
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
    <div className="bold-card rounded-2xl overflow-hidden flex flex-col group h-full relative">
      {/* Top Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1424] via-transparent to-black/40" />

        {/* Floating Date Badge */}
        <div className="absolute top-3 left-3 bg-[#070a12]/90 backdrop-blur-md border border-orange-500/40 rounded-xl px-3 py-1.5 flex flex-col items-center shadow-lg">
          <span className="text-[10px] font-extrabold text-orange-400 tracking-wider">
            {dateInfo.month}
          </span>
          <span className="text-lg font-black text-white leading-none">
            {dateInfo.day}
          </span>
        </div>

        {/* Featured Ribbon */}
        {event.featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Category & Price Tags on Image Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900/90 text-orange-300 border border-slate-700/60 backdrop-blur-sm">
            <Tag className="w-3 h-3" />
            {event.category}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg backdrop-blur-sm border ${
              event.price_type === "free"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                : "bg-indigo-950/80 text-indigo-300 border-indigo-500/30"
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
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              {event.city_area}
            </span>
            {event.time_display && (
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {event.time_display}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/events/${event.slug}`} className="block group-hover:text-orange-400 transition-colors">
            <h3 className="font-extrabold text-lg sm:text-xl text-white leading-snug line-clamp-2">
              {event.title}
            </h3>
          </Link>

          {/* Venue & Short description */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.short_description || event.description}
          </p>

          <p className="text-xs text-slate-400 truncate flex items-center gap-1 pt-1 font-mono">
            <span className="text-slate-400">Venue:</span>
            <span className="text-slate-300">{event.venue_name}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
          {/* Details Link */}
          <Link
            href={`/events/${event.slug}`}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700/80 hover:border-slate-500 hover:text-white transition-colors text-center"
          >
            Details
          </Link>

          {/* Direct External Registration Link */}
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/25 transition-all text-center group/btn active:scale-95"
          >
            <span>Register</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
