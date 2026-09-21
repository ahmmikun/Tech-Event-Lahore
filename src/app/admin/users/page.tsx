import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./users-client";
import type { Profile } from "@/types/database";
import { Users, Terminal } from "lucide-react";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profiles: Profile[] = [];
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      profiles = data as Profile[];
    }
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-8 text-[#111111]">
      <div className="space-y-2 border-b border-[#E5E7EB] pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[11px] font-mono font-bold uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" />
          Access Control
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          User Roles Management
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Manage registered organizers and grant or revoke administrative roles.
        </p>
      </div>

      <UsersClient initialProfiles={profiles} currentUserId={user?.id || ""} />
    </div>
  );
}
