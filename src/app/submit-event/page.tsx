"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EventForm } from "@/components/events/event-form";
import { Terminal, ShieldCheck } from "lucide-react";

export default function SubmitEventPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        if (user.email?.toLowerCase() === "sheikhsalmanahmedofficial@gmail.com") {
          setIsAdmin(true);
        } else {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            if (profile?.role === "admin") {
              setIsAdmin(true);
            }
          } catch {
            // Non-admin
          }
        }
      }
    });
  }, []);

  return (
    <div className="min-h-screen py-12 bg-[#FAFAF8] text-[#111111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-[#E5E7EB] pb-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#E5E7EB] text-[#111111] text-xs font-mono tracking-wider shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
              ORGANIZER DESK
            </div>

            {isAdmin && (
              <Link
                href="/admin/events/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#2563EB] text-xs font-bold font-mono hover:bg-blue-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Quick Publisher</span>
              </Link>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Post a Tech Event in Lahore
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            Submit your hackathon, meetup, summit, or demo day. Free listing with direct link to your external ticketing portal.
          </p>
        </div>

        <EventForm
          role={isAdmin ? "admin" : "user"}
          mode="create"
          redirectPath={isAdmin ? "/admin/events" : "/my-events"}
        />
      </div>
    </div>
  );
}
