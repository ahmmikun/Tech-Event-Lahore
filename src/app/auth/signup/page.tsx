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
  const [errorMessage, setErrorMessage] = useState("");

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
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-extrabold text-[#111111] tracking-tight">
            LAHORE TECH <span className="text-[#2563EB]">PORTAL</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-[#111111] tracking-tight">
          Create Organizer Account
        </h2>
        <p className="text-xs text-[#6B7280]">
          Join Lahore&apos;s developer and tech organizer collective
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-rose-900 block">Authentication Error</span>
            <span className="text-rose-700 leading-relaxed block">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-md space-y-6">
        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151]">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Usman Tariq"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (min. 6 characters)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#111111] hover:bg-[#2563EB] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#6B7280]">
          Already have an account?{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="text-[#2563EB] font-bold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAFAF8]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-[#2563EB]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </div>
  );
}
