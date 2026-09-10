"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types/database";
import { 
  Save, 
  Sparkles, 
  Eye, 
  Type, 
  AlignLeft, 
  MousePointerClick, 
  BellRing,
  Loader2
} from "lucide-react";

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [heroHeading, setHeroHeading] = useState(initialSettings.hero_heading);
  const [heroDescription, setHeroDescription] = useState(initialSettings.hero_description);
  const [heroCtaText, setHeroCtaText] = useState(initialSettings.hero_cta_text);
  const [announcementText, setAnnouncementText] = useState(initialSettings.announcement_text || "");
  const [bannerActive, setBannerActive] = useState(initialSettings.banner_active);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          id: 1,
          hero_heading: heroHeading.trim(),
          hero_description: heroDescription.trim(),
          hero_cta_text: heroCtaText.trim(),
          announcement_text: announcementText.trim(),
          banner_active: bannerActive,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Website copy updated successfully! Changes are live on the homepage.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update website copy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Form (7 Cols) */}
      <form onSubmit={handleSave} className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0e1424] border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-orange-500" />
              Hero & Copy Editor
            </h2>
            <p className="text-xs text-slate-400">
              Update the public headings and call-to-action text in real-time
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving..." : "Save Copy Changes"}</span>
          </button>
        </div>

        {/* Hero Heading */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-orange-400" />
            Hero Main Heading
          </label>
          <input
            type="text"
            required
            value={heroHeading}
            onChange={(e) => setHeroHeading(e.target.value)}
            placeholder="Discover Lahore's Most Exciting Events"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-base font-bold focus:border-orange-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">
            The primary bold headline displayed prominently on the homepage hero.
          </p>
        </div>

        {/* Hero Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <AlignLeft className="w-4 h-4 text-orange-400" />
            Hero Description / Subtitle
          </label>
          <textarea
            required
            rows={3}
            value={heroDescription}
            onChange={(e) => setHeroDescription(e.target.value)}
            placeholder="From tech summits and startup demos to live concerts..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Hero CTA Button Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MousePointerClick className="w-4 h-4 text-orange-400" />
            Primary CTA Button Text
          </label>
          <input
            type="text"
            required
            value={heroCtaText}
            onChange={(e) => setHeroCtaText(e.target.value)}
            placeholder="Explore Events"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm font-semibold focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Announcement Banner */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-amber-400" />
              Top Announcement Banner
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
              />
              <span>Banner Active</span>
            </label>
          </div>

          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="🔥 Live in Lahore: Discover verified upcoming events..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Publish Website Copy"}</span>
          </button>
        </div>
      </form>

      {/* Right Live Preview Box (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-orange-400" />
          Live Homepage Hero Preview
        </div>

        <div className="p-6 rounded-3xl bg-[#070a12] border-2 border-orange-500/30 shadow-2xl space-y-5 text-center relative overflow-hidden">
          {bannerActive && announcementText && (
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-1.5 px-3 rounded-lg text-[11px] font-bold">
              {announcementText}
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-orange-500/40 text-orange-400 text-[10px] font-bold">
            GULBERG • DHA • JOHAR TOWN
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {heroHeading || "Discover Lahore's Most Exciting Events"}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            {heroDescription || "From tech summits and startup demos to live concerts..."}
          </p>

          <div className="pt-2 flex justify-center">
            <div className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-orange-600 shadow-md">
              {heroCtaText || "Explore Events"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-300">CMS Tip:</span> Changes saved here instantly update the public homepage without needing code deployment.
        </div>
      </div>
    </div>
  );
}
