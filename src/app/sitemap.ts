import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/submit-event`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("events")
      .select("slug, updated_at")
      .eq("status", "approved")
      .order("date_start", { ascending: true });

    const eventRoutes: MetadataRoute.Sitemap = (data || []).map((event) => ({
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: event.updated_at ? new Date(event.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...eventRoutes];
  } catch {
    // If the database is unreachable at build/request time, still serve static routes.
    return staticRoutes;
  }
}
