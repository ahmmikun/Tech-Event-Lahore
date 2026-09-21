"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { 
  PlusCircle, 
  User, 
  LogOut, 
  ShieldCheck, 
  CalendarDays, 
  Menu, 
  X,
  ChevronDown,
  Terminal
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const isSuperAdminEmail =
            user.email?.toLowerCase() === "sheikhsalmanahmedofficial@gmail.com";

          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data) {
            const userProfile: Profile = {
              ...(data as Profile),
              role: isSuperAdminEmail ? "admin" : (data.role as "admin" | "user"),
            };
            setProfile(userProfile);

            if (userProfile.role === "admin") {
              const { count } = await supabase
                .from("events")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");
              setPendingCount(count || 0);
            }
          } else {
            // User authenticated without profile row yet
            const userProfile: Profile = {
              id: user.id,
              email: user.email || "",
              full_name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0] ||
                "User",
              avatar_url: user.user_metadata?.avatar_url || null,
              role: isSuperAdminEmail
                ? "admin"
                : (user.user_metadata?.role as any) || "user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setProfile(userProfile);

            if (userProfile.role === "admin") {
              const { count } = await supabase
                .from("events")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");
              setPendingCount(count || 0);
            }
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          loadUser();
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-[#E5E7EB] bg-[#FAFAF8]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo - Light Editorial */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#111111] text-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#111111] group-hover:text-[#2563EB] transition-colors">
                  LAHORE TECH
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#E5E7EB] text-[#4B5563] rounded">
                  LHE
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280] tracking-wide">
                31.5204° N · DISCOVERY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/events"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/events"
                  ? "text-[#111111] bg-[#E5E7EB]/70"
                  : "text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6]"
              }`}
            >
              Events
            </Link>

            <Link
              href="/events?category=AI+%26+Machine+Learning"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6] transition-colors"
            >
              Categories
            </Link>


            {profile && (
              <Link
                href="/my-events"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === "/my-events"
                    ? "text-[#111111] bg-[#E5E7EB]/70"
                    : "text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6]"
                }`}
              >
                My Events
              </Link>
            )}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith("/admin")
                    ? "text-[#2563EB] bg-blue-50"
                    : "text-[#2563EB] hover:bg-blue-50/70"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                Admin
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold bg-red-600 text-white rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* Right Action & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/submit-event"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-all duration-200 active:scale-98"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Submit Event
            </Link>

            {!loading && (
              <>
                {profile ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pl-3 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all text-left shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#111111] truncate max-w-[120px]">
                          {profile.full_name || profile.email.split("@")[0]}
                        </span>
                        <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-wider">
                          {profile.role}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#111111] font-bold text-xs">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full rounded-md object-cover"
                          />
                        ) : (
                          profile.email[0].toUpperCase()
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
                    </button>

                    {userMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E5E7EB] shadow-xl py-2 z-50 animate-in fade-in"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-[#F3F4F6]">
                          <p className="text-[11px] text-[#6B7280]">Signed in as</p>
                          <p className="text-xs font-semibold text-[#111111] truncate">{profile.email}</p>
                        </div>

                        <Link
                          href="/my-events"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#374151] hover:text-[#111111] hover:bg-[#F9FAFB]"
                        >
                          <CalendarDays className="w-4 h-4 text-[#2563EB]" />
                          My Submitted Events
                        </Link>

                        {profile.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#2563EB] hover:bg-blue-50/50"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                              Admin Dashboard
                            </span>
                            {pendingCount > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-red-600 text-white rounded-full">
                                {pendingCount}
                              </span>
                            )}
                          </Link>
                        )}

                        <div className="border-t border-[#F3F4F6] my-1"></div>

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-[#111111] bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5 text-[#6B7280]" />
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/submit-event"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#111111]"
            >
              + Submit
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#111111] hover:bg-[#F3F4F6]"
          >
            All Events
          </Link>
          <Link
            href="/events?category=AI+%26+Machine+Learning"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
          >
            Categories
          </Link>
          <Link
            href="/submit-event"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#2563EB] hover:bg-blue-50"
          >
            Submit an Event
          </Link>

          {profile && (
            <Link
              href="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#111111] hover:bg-[#F3F4F6]"
            >
              My Submitted Events
            </Link>
          )}

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-[#2563EB] hover:bg-blue-50"
            >
              <span>Admin Panel</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-extrabold bg-red-600 text-white rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </Link>
          )}

          <div className="border-t border-[#E5E7EB] pt-3">
            {profile ? (
              <div className="space-y-2">
                <div className="px-3 text-xs text-[#6B7280]">
                  Signed in as <span className="text-[#111111] font-bold">{profile.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB]"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
