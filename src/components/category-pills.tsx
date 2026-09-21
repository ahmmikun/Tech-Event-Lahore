"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EVENT_CATEGORIES } from "@/types/database";
import { 
  Cpu, 
  Code2, 
  Cloud, 
  Shield, 
  Rocket, 
  Palette, 
  Trophy, 
  GitBranch,
  Layers,
  Laptop
} from "lucide-react";

interface CategoryPillsProps {
  currentCategory?: string;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "AI & Machine Learning": <Cpu className="w-3.5 h-3.5" />,
  "Web Development": <Code2 className="w-3.5 h-3.5" />,
  "Cloud & DevOps": <Cloud className="w-3.5 h-3.5" />,
  "Cybersecurity": <Shield className="w-3.5 h-3.5" />,
  "Startups & Venture": <Rocket className="w-3.5 h-3.5" />,
  "Design & Product": <Palette className="w-3.5 h-3.5" />,
  "Hackathons": <Trophy className="w-3.5 h-3.5" />,
  "Open Source": <GitBranch className="w-3.5 h-3.5" />,
  "Tech & AI": <Laptop className="w-3.5 h-3.5" />,
  "Workshops": <Layers className="w-3.5 h-3.5" />,
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
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none ${className}`}>
      <button
        onClick={() => handleSelect("All")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 border ${
          selectedCategory === "All"
            ? "bg-[#111111] text-white border-[#111111] shadow-sm"
            : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#111111]"
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All</span>
      </button>

      {EVENT_CATEGORIES.map((cat) => {
        const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 border ${
              isActive
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#111111]"
            }`}
          >
            <span>{CATEGORY_ICONS[cat] || <Layers className="w-3.5 h-3.5" />}</span>
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
