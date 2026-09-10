"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { ShieldCheck, User, Search, ShieldAlert, Loader2 } from "lucide-react";

interface UsersClientProps {
  initialProfiles: Profile[];
  currentUserId: string;
}

export function UsersClient({ initialProfiles, currentUserId }: UsersClientProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.full_name && p.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggleRole = async (profile: Profile) => {
    if (profile.id === currentUserId) {
      toast.error("You cannot change your own admin role.");
      return;
    }

    const nextRole = profile.role === "admin" ? "user" : "admin";
    setUpdatingId(profile.id);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: nextRole })
        .eq("id", profile.id);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, role: nextRole } : p))
      );
      toast.success(
        `Updated ${profile.email} role to ${nextRole.toUpperCase()}`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-white placeholder-slate-400 text-xs focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#0e1424] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Role Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filtered.map((profile) => {
                const isAdmin = profile.role === "admin";
                const isSelf = profile.id === currentUserId;

                return (
                  <tr key={profile.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                          {profile.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{profile.full_name || "Lahore User"}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-600/30 text-orange-400 font-normal">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{profile.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-300 border border-red-500/40">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                          <User className="w-3 h-3" /> Organizer / User
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      {!isSelf ? (
                        <button
                          type="button"
                          onClick={() => handleToggleRole(profile)}
                          disabled={updatingId === profile.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isAdmin
                              ? "bg-slate-900 text-slate-300 hover:text-red-400 border-slate-700 hover:border-red-500/50"
                              : "bg-orange-600 text-white hover:bg-orange-500 border-orange-500 shadow-sm"
                          }`}
                        >
                          {updatingId === profile.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                          ) : isAdmin ? (
                            "Demote to User"
                          ) : (
                            "Promote to Admin"
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Current Session</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
