"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";

interface EventSearchProps {
  placeholder?: string;
  className?: string;
}

export function EventSearch({
  placeholder = "Search events, communities, venues...",
  className = "",
}: EventSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className={`relative flex items-center ${className}`}>
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-white border border-[#E5E7EB] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none text-[#111111] placeholder-[#9CA3AF] text-sm font-medium transition-all shadow-sm"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#111111]"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#2563EB] text-white font-bold text-xs shadow-sm transition-all active:scale-98 disabled:opacity-70 flex items-center gap-1.5"
        >
          <span>{isPending ? "..." : "Search"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
