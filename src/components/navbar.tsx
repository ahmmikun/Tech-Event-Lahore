"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { 
  Sparkles, 
  PlusCircle, 
  User, 
  LogOut, 
  ShieldCheck, 
  CalendarDays, 
  Menu, 
  X,
  MapPin,
  ChevronDown
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
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data) {
            setProfile(data as Profile);

            // If admin, fetch count of pending events
            if (data.role === "admin") {
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

    // Listen to auth changes
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
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  EVENT FINDER
                </span>
                <span className="px-2 py-0.5 text-xs font-black tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded shadow-sm">
                  LAHORE
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-500 inline" /> Gulberg • DHA • Johar Town
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/events"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/events"
                  ? "text-orange-400 bg-orange-500/10"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Explore Events
            </Link>

            <Link
              href="/events?area=Gulberg"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Areas
            </Link>

            {profile && (
              <Link
                href="/my-events"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === "/my-events"
                    ? "text-orange-400 bg-orange-500/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                My Submissions
              </Link>
            )}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith("/admin")
                    ? "text-orange-400 bg-orange-500/10"
                    : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Post an Event
            </Link>

            {!loading && (
              <>
                {profile ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-orange-500/50 transition-all text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                          {profile.full_name || profile.email.split("@")[0]}
                        </span>
                        <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
                          {profile.role}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold text-xs">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          profile.email[0].toUpperCase()
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {userMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0e1424] border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-slate-800">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="text-xs font-semibold text-white truncate">{profile.email}</p>
                        </div>

                        <Link
                          href="/my-events"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60"
                        >
                          <CalendarDays className="w-4 h-4 text-orange-400" />
                          My Submitted Events
                        </Link>

                        {profile.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-amber-300 hover:text-amber-200 hover:bg-slate-800/60"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-amber-400" />
                              Admin Dashboard
                            </span>
                            {pendingCount > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-red-600 text-white rounded-full">
                                {pendingCount}
                              </span>
                            )}
                          </Link>
                        )}

                        <div className="border-t border-slate-800 my-1"></div>

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-200 bg-slate-900 border border-slate-700/80 hover:border-slate-500 hover:text-white transition-all"
                  >
                    <User className="w-4 h-4 text-orange-400" />
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
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-orange-600"
            >
              + Post
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070a12] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-200 hover:bg-slate-800"
          >
            Explore Events
          </Link>
          <Link
            href="/submit-event"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-orange-400 hover:bg-orange-500/10"
          >
            Post an Event
          </Link>
          {profile && (
            <Link
              href="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-200 hover:bg-slate-800"
            >
              My Submitted Events
            </Link>
          )}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold text-amber-400 hover:bg-amber-500/10"
            >
              <span>Admin Panel</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-extrabold bg-red-600 text-white rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </Link>
          )}
          <div className="border-t border-slate-800 pt-3">
            {profile ? (
              <div className="space-y-2">
                <div className="px-3 text-xs text-slate-400">
                  Signed in as <span className="text-white font-bold">{profile.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl font-bold text-white bg-slate-800 border border-slate-700"
              >
                Sign In / Join
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
