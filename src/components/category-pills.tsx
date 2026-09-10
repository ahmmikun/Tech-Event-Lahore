"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EVENT_CATEGORIES } from "@/types/database";
import { 
  Laptop, 
  Music, 
  UtensilsCrossed, 
  Palette, 
  Briefcase, 
  Trophy, 
  BookOpen, 
  Laugh,
  Layers
} from "lucide-react";

interface CategoryPillsProps {
  currentCategory?: string;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Tech & AI": <Laptop className="w-4 h-4" />,
  "Music & Concerts": <Music className="w-4 h-4" />,
  "Food & Festivals": <UtensilsCrossed className="w-4 h-4" />,
  "Art & Culture": <Palette className="w-4 h-4" />,
  "Business & Startups": <Briefcase className="w-4 h-4" />,
  "Sports & Fitness": <Trophy className="w-4 h-4" />,
  "Workshops": <BookOpen className="w-4 h-4" />,
  "Comedy & Theatre": <Laugh className="w-4 h-4" />,
};

export function CategoryPills({ currentCategory, className = "" }: CategoryPillsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = currentCategory || searchParams.get("category") || "All";

  const handleSelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5 ${className}`}>
      <button
        onClick={() => handleSelect("All")}
        className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-black transition-all border ${
          selectedCategory === "All"
            ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500 shadow-lg shadow-orange-600/30 scale-102"
            : "bg-slate-900/90 text-slate-300 border-slate-700/70 hover:border-slate-500 hover:text-white"
        }`}
      >
        <Layers className="w-4 h-4 text-orange-400" />
        <span>All</span>
      </button>

      {EVENT_CATEGORIES.map((cat) => {
        const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-black transition-all border ${
              isActive
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500 shadow-lg shadow-orange-600/30 scale-102"
                : "bg-slate-900/90 text-slate-300 border-slate-700/70 hover:border-slate-500 hover:text-white"
            }`}
          >
            <span className={isActive ? "text-white" : "text-orange-400"}>
              {CATEGORY_ICONS[cat] || <Layers className="w-4 h-4" />}
            </span>
            <span className="truncate">{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
