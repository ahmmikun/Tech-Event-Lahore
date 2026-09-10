import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import type { SiteSettings } from "@/types/database";
import { Settings2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const settings: SiteSettings = data || {
    id: 1,
    hero_heading: "Discover Lahore's Most Exciting Events",
    hero_description:
      "From tech summits and startup demos to live concerts, street food carnivals, and cultural festivals across Lahore.",
    hero_cta_text: "Explore Events",
    announcement_text:
      "🔥 Live in Lahore: Discover verified upcoming events across Gulberg, DHA, Johar Town & more!",
    banner_active: true,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider">
          <Settings2 className="w-3.5 h-3.5 text-orange-500" />
          Content Management System
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Website Text Customization
        </h1>
        <p className="text-sm text-slate-400">
          Edit headline copy, descriptions, call-to-actions, and announcements across the site.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
