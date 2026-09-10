"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface EventSearchProps {
  placeholder?: string;
  className?: string;
}

export function EventSearch({
  placeholder = "Search events by title, venue, or keywords...",
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-4 rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 focus:border-orange-500 focus:outline-none text-white placeholder-slate-400 text-sm md:text-base font-medium transition-all shadow-xl shadow-black/40"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-md shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-70"
        >
          {isPending ? "..." : "Search"}
        </button>
      </div>
    </form>
  );
}
