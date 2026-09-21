"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { ShieldCheck, Search, ShieldAlert, Loader2 } from "lucide-react";
import { formatEventDate } from "@/lib/utils";

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
    <div className="space-y-6 text-[#111111]">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Role Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((profile) => {
                const isAdmin = profile.role === "admin";
                const isSelf = profile.id === currentUserId;

                return (
                  <tr key={profile.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-bold text-[#111111] text-xs font-mono">
                          {profile.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#111111] flex items-center gap-1.5">
                            <span>{profile.full_name || "Community Member"}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#2563EB] font-normal font-mono">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6B7280] font-mono">
                            {profile.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                          isAdmin
                            ? "bg-blue-50 text-[#2563EB] border border-blue-200"
                            : "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]"
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-3 h-3" /> : null}
                        {profile.role}
                      </span>
                    </td>

                    <td className="p-4 text-[#6B7280] font-mono text-[11px]">
                      {formatEventDate(profile.created_at)}
                    </td>

                    <td className="p-4 text-right">
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => handleToggleRole(profile)}
                          disabled={updatingId === profile.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isAdmin
                              ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              : "bg-[#111111] text-white border-[#111111] hover:bg-[#2563EB]"
                          }`}
                        >
                          {updatingId === profile.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isAdmin ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                          <span>{isAdmin ? "Revoke Admin" : "Make Admin"}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#6B7280]">
                    No users match your search keyword.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
