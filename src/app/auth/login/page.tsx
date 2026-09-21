"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Terminal,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGitHubLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(errorParam || "");

  const handleGitHubLogin = async () => {
    setGitHubLoading(true);
    setErrorMessage("");
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to initiate GitHub sign in";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setGitHubLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else if (data.user) {
        toast.success("Welcome back!");
        router.push(next);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-extrabold text-[#111111] tracking-tight">
            LAHORE TECH <span className="text-[#2563EB]">PORTAL</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-[#111111] tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-[#6B7280]">
          Manage your submitted tech events and community listings
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card */}
      <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-md space-y-6">
        {/* GitHub Sign In Button */}
        <button
          type="button"
          onClick={handleGitHubLogin}
          disabled={githubLoading || loading}
          className="w-full py-3 px-4 rounded-lg font-bold text-xs sm:text-sm text-[#111111] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-98 disabled:opacity-60 cursor-pointer"
        >
          {githubLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.791-1.508-3.791-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.077-.685.077-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.637 1.225 3.279.937.102-.728.393-1.225.715-1.507-2.498-.284-5.124-1.249-5.124-5.56 0-1.228.439-2.232 1.16-3.019-.116-.284-.503-1.428.11-2.977 0 0 .945-.303 3.094 1.153A10.79 10.79 0 0 1 12 6.185c.956.004 1.919.129 2.818.38 2.148-1.456 3.09-1.153 3.09-1.153.615 1.549.228 2.693.112 2.977.723.787 1.158 1.791 1.158 3.019 0 4.322-2.63 5.273-5.136 5.552.404.348.766 1.033.766 2.083 0 1.504-.014 2.718-.014 3.088 0 .3.203.651.774.541A11.252 11.252 0 0 0 12 .75Z" />
            </svg>
          )}
          <span>
            {githubLoading
              ? "Connecting with GitHub..."
              : "Continue with GitHub"}
          </span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E5E7EB] w-full" />
          <span className="bg-white px-3 text-[11px] font-mono uppercase tracking-wider text-[#6B7280] relative">
            Or with email
          </span>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="organizer@lahore.pk"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || githubLoading}
            className="w-full py-3 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? "Signing In..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>


        <div className="text-center text-xs text-[#6B7280]">
          Don&apos;t have an account yet?{" "}
          <Link
            href={`/auth/signup?next=${encodeURIComponent(next)}`}
            className="text-[#2563EB] font-bold hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAFAF8]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-[#2563EB]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
