import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  Clock, 
  Calendar, 
  Settings2, 
  Users, 
  ArrowLeft,
  Terminal
} from "lucide-react";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let pendingCount = 0;

  try {
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingCount = count || 0;
  } catch {
    // Fallback
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const isSuperAdminEmail =
    user.email?.toLowerCase() === "sheikhsalmanahmedofficial@gmail.com";

  let isAdmin = isSuperAdminEmail;

  if (!isAdmin) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        isAdmin = true;
      }
    } catch {
      // Ignore
    }
  }

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#E5E7EB] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Admin Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-[#111111]">
                ADMIN CONTROL
              </span>
            </div>
            <p className="text-[11px] text-[#2563EB] font-mono font-bold">Lahore Tech Portal</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                Moderation Queue
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-600 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors"
            >
              <Settings2 className="w-4 h-4 text-[#4B5563]" />
              Website Customization
            </Link>

            <Link
              href="/admin/events"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#4B5563]" />
              All Events
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors"
            >
              <Users className="w-4 h-4 text-[#4B5563]" />
              User Roles
            </Link>
          </nav>
        </div>

        {/* Back to Public Site */}
        <div className="pt-6 border-t border-[#E5E7EB]">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
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
