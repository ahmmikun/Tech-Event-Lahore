import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./users-client";
import type { Profile } from "@/types/database";
import { Users } from "lucide-react";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const profiles = (data as Profile[]) || [];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          Access Control
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          User Roles Management
        </h1>
        <p className="text-sm text-slate-400">
          View registered event organizers and grant or revoke administrative rights.
        </p>
      </div>

      <UsersClient initialProfiles={profiles} currentUserId={user?.id || ""} />
    </div>
  );
}
