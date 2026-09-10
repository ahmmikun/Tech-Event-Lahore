import Link from "next/link";
import { Sparkles, MapPin, Heart, ArrowUpRight } from "lucide-react";
import { LAHORE_AREAS, EVENT_CATEGORIES } from "@/types/database";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05070d] text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  EVENT FINDER
                </span>
                <span className="px-2 py-0.5 text-xs font-black uppercase bg-orange-600 text-white rounded">
                  LAHORE
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The definitive discovery engine for Lahore's pulse. From tech summits and venture demo days to classical Sufi nights, culinary festivals, and indie art exhibitions across the city.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-orange-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" /> Lahore, Pakistan
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                100% Free for Attendees
              </span>
            </div>
          </div>

          {/* Col 3: Lahore Localities */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Popular Localities
            </h3>
            <ul className="space-y-2 text-sm">
              {LAHORE_AREAS.slice(0, 6).map((area) => (
                <li key={area}>
                  <Link
                    href={`/events?area=${encodeURIComponent(area)}`}
                    className="hover:text-orange-400 transition-colors flex items-center gap-1"
                  >
                    <span>{area}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Top Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {EVENT_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/events?category=${encodeURIComponent(cat)}`}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: For Organizers */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Organizers
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300 leading-normal">
                Hosting a workshop, conference, concert, or meetup in Lahore?
              </p>
              <Link
                href="/submit-event"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors"
              >
                Submit Event Free
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Event Finder Lahore. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the Lahore Community
          </p>
        </div>
      </div>
    </footer>
  );
}
