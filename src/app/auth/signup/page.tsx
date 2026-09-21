"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGitHubLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else if (data.user) {
        toast.success("Account created successfully!");
        router.push(next);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed";
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
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            EVENT FINDER <span className="text-orange-500">LAHORE</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-white">Create an Account</h2>
        <p className="text-xs text-slate-400">
          Join the Lahore event creator community
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card */}
      <div className="p-8 rounded-3xl bg-[#0e1424] border border-slate-800 shadow-2xl space-y-6">
        {/* GitHub Sign In Button */}
        <button
          type="button"
          onClick={handleGitHubLogin}
          disabled={githubLoading || loading}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-100 bg-slate-900 border-2 border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
        >
          {githubLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          ) : (
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.791-1.508-3.791-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.077-.685.077-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.637 1.225 3.279.937.102-.728.393-1.225.715-1.507-2.498-.284-5.124-1.249-5.124-5.56 0-1.228.439-2.232 1.16-3.019-.116-.284-.503-1.428.11-2.977 0 0 .945-.303 3.094 1.153A10.79 10.79 0 0 1 12 6.185c.956.004 1.919.129 2.818.38 2.148-1.456 3.09-1.153 3.09-1.153.615 1.549.228 2.693.112 2.977.723.787 1.158 1.791 1.158 3.019 0 4.322-2.63 5.273-5.136 5.552.404.348.766 1.033.766 2.083 0 1.504-.014 2.718-.014 3.088 0 .3.203.651.774.541A11.252 11.252 0 0 0 12 .75Z" />
            </svg>
          )}
          <span>
            {githubLoading
              ? "Connecting with GitHub..."
              : "Sign up with GitHub"}
          </span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0e1424] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
            Or with email
          </span>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Your Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ali Khan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="organizer@lahore.pk"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || githubLoading}
            className="w-full py-3 rounded-xl font-extrabold text-sm text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="text-orange-400 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-orange-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </div>
  );
}
