"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types/database";
import { 
  Save, 
  Type, 
  AlignLeft, 
  MousePointerClick, 
  BellRing,
  Loader2,
  Eye
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-[#111111]">
      {/* Left Form (7 Cols) */}
      <form onSubmit={handleSave} className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <Type className="w-4 h-4 text-[#2563EB]" />
              Hero & Copy Editor
            </h2>
            <p className="text-xs text-[#6B7280]">
              Update the public headings and call-to-action text in real-time
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-all active:scale-98 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        {/* Hero Heading */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151] flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[#2563EB]" />
            Hero Main Headline
          </label>
          <input
            type="text"
            required
            value={heroHeading}
            onChange={(e) => setHeroHeading(e.target.value)}
            placeholder="Discover what's happening in Lahore's tech scene."
            className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-sm font-bold focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        {/* Hero Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151] flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#2563EB]" />
            Hero Supporting Paragraph
          </label>
          <textarea
            required
            rows={3}
            value={heroDescription}
            onChange={(e) => setHeroDescription(e.target.value)}
            placeholder="The definitive discovery platform for Lahore's tech community..."
            className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none leading-relaxed"
          />
        </div>

        {/* Hero CTA Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151] flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-[#2563EB]" />
            Primary CTA Button Text
          </label>
          <input
            type="text"
            required
            value={heroCtaText}
            onChange={(e) => setHeroCtaText(e.target.value)}
            placeholder="Explore Events"
            className="w-full px-4 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs font-bold focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        {/* Announcement Strip */}
        <div className="pt-4 border-t border-[#F3F4F6] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151] flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-[#2563EB]" />
              Announcement Alert Strip
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-[#4B5563] cursor-pointer">
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="rounded text-[#2563EB]"
              />
              Show Top Alert Strip
            </label>
          </div>

          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="⚡ Live in Lahore: Discover verified upcoming tech conferences & meetups!"
            className="w-full px-4 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </form>

      {/* Right Live Preview Box (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280]">
          <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
          Live Preview Preview
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-5">
          {bannerActive && announcementText && (
            <div className="p-2 rounded bg-[#111111] text-white text-[11px] font-mono text-center truncate">
              {announcementText}
            </div>
          )}

          <div className="space-y-3">
            <div className="inline-block px-2.5 py-0.5 rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[10px] font-mono text-[#6B7280]">
              LAHORE, PAKISTAN · 31.5204° N
            </div>
            <h3 className="text-xl font-extrabold text-[#111111] leading-snug">
              {heroHeading || "Discover what's happening in Lahore's tech scene."}
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              {heroDescription || "The definitive discovery platform for Lahore's tech community."}
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold shadow-sm">
                {heroCtaText || "Explore Events"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
