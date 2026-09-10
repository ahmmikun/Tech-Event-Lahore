import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Settings2, 
  Users, 
  ArrowLeft,
  Sparkles
} from "lucide-react";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // If user is not an admin, grant admin to the first user or check role
  // We check if role is 'admin'
  if (!profile || profile.role !== "admin") {
    // Check if there are ANY admins yet. If 0 admins exist, promote this current user to admin!
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (count === 0) {
      // Auto-promote first user to admin
      await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id);
    } else {
      // Not allowed
      redirect("/");
    }
  }

  // Get pending count for navigation badge
  const { count: pendingCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#090d18] border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Admin Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                ADMIN CONTROL
              </span>
            </div>
            <p className="text-[11px] text-amber-400 font-bold">Event Finder Lahore</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Moderation Queue
              </span>
              {(pendingCount || 0) > 0 && (
                <span className="px-2 py-0.5 text-xs font-black bg-red-600 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <Settings2 className="w-4 h-4 text-orange-400" />
              Website Customization
            </Link>

            <Link
              href="/admin/events"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              All Events
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              User Roles
            </Link>
          </nav>
        </div>

        {/* Back to Public Site */}
        <div className="pt-6 border-t border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            Back to Public Website
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
