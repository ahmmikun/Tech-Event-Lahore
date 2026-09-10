"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LAHORE_AREAS } from "@/types/database";
import { MapPin } from "lucide-react";

interface AreaPillsProps {
  currentArea?: string;
  className?: string;
}

export function AreaPills({ currentArea, className = "" }: AreaPillsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedArea = currentArea || searchParams.get("area") || "All";

  const handleSelect = (area: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (area === "All") {
      params.delete("area");
    } else {
      params.set("area", area);
    }
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none ${className}`}>
      <button
        onClick={() => handleSelect("All")}
        className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
          selectedArea === "All"
            ? "bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30 scale-105"
            : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white"
        }`}
      >
        All Lahore
      </button>

      {LAHORE_AREAS.map((area) => {
        const isActive = selectedArea.toLowerCase() === area.toLowerCase();
        return (
          <button
            key={area}
            onClick={() => handleSelect(area)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              isActive
                ? "bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30 scale-105"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white"
            }`}
          >
            <MapPin className={`w-3 h-3 ${isActive ? "text-white" : "text-orange-400"}`} />
            {area}
          </button>
        );
      })}
    </div>
  );
}
