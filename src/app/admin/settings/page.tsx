import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import type { SiteSettings } from "@/types/database";
import { Terminal } from "lucide-react";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  let settings: SiteSettings = {
    id: 1,
    hero_heading: "Discover what's happening in Lahore's tech scene.",
    hero_description:
      "The definitive discovery engine for Lahore's tech community. Find hackathons, developer meetups, AI workshops, startup demos, and tech conferences across the city.",
    hero_cta_text: "Explore Events",
    announcement_text:
      "⚡ Live in Lahore: Discover verified upcoming tech conferences, hackathons & developer meetups!",
    banner_active: true,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };

  try {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      settings = data;
    }
  } catch {
    // Graceful fallback
  }

  return (
    <div className="space-y-8 text-[#111111]">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E5E7EB] pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" />
          Content Management
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          Website Text Customization
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Configure homepage headline copy, descriptions, call-to-actions, and announcement alerts.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
