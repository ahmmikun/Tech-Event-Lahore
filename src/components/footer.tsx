import Link from "next/link";
import { Terminal, MapPin, Heart, ArrowUpRight } from "lucide-react";
import { LAHORE_AREAS, EVENT_CATEGORIES } from "@/types/database";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white text-[#6B7280] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center shadow-sm">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#111111]">
                  LAHORE TECH
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-[#E5E7EB] text-[#374151] rounded">
                  PORTAL
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#4B5563] max-w-sm leading-relaxed">
              The independent, community-driven event discovery platform for Lahore&apos;s technology ecosystem. Connecting developers, builders, researchers, and founders across the city.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] font-mono text-[11px]">
                <MapPin className="w-3 h-3 text-[#2563EB]" /> 31.5204° N · Lahore, PK
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#FAFAF8] border border-[#E5E7EB] text-[#4B5563] text-[11px]">
                Free for Community
              </span>
            </div>
          </div>

          {/* Lahore Tech Hubs & Localities */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Tech Corridors
            </h3>
            <ul className="space-y-2 text-xs">
              {LAHORE_AREAS.slice(0, 6).map((area) => (
                <li key={area}>
                  <Link
                    href={`/events?area=${encodeURIComponent(area)}`}
                    className="text-[#4B5563] hover:text-[#2563EB] transition-colors"
                  >
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {EVENT_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/events?category=${encodeURIComponent(cat)}`}
                    className="text-[#4B5563] hover:text-[#2563EB] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Organizers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              For Organizers
            </h3>
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] space-y-3">
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Hosting a tech meetup, workshop, hackathon, or conference in Lahore?
              </p>
              <Link
                href="/submit-event"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB] transition-colors shadow-sm"
              >
                Submit Event Free
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <p>© {new Date().getFullYear()} Lahore Tech Events. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for the Lahore Tech Community
          </p>
        </div>
      </div>
    </footer>
  );
}
