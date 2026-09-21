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
        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
          selectedArea === "All"
            ? "bg-[#111111] text-white border-[#111111] shadow-sm"
            : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#111111]"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              isActive
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#111111]"
            }`}
          >
            <MapPin className={`w-3 h-3 ${isActive ? "text-white" : "text-[#2563EB]"}`} />
            {area}
          </button>
        );
      })}
    </div>
  );
}
