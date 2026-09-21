import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://uvggwzauotvdhdbwuqil.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_1nvsRidtWRq11sbBkERjfw_ZvMWUbUM";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;

  return createBrowserClient(supabaseUrl, supabaseKey);
}
