"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/image-upload";
import { 
  type EventItem, 
  type EventStatus, 
  type PriceType,
  type VenueType
} from "@/types/database";
import { slugify } from "@/lib/utils";
import { 
  Send, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  FileText,
  Sparkles,
  Archive,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Tag,
  ShieldCheck,
  User,
  Building2,
  Video,
  Globe
} from "lucide-react";

interface EventFormProps {
  role?: "user" | "admin";
  mode?: "create" | "edit";
  initialData?: Partial<EventItem>;
  onSuccess?: (event: EventItem) => void;
  onCancel?: () => void;
  redirectPath?: string;
}

export function EventForm({
  role = "user",
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
  redirectPath,
}: EventFormProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [category, setCategory] = useState<string>(initialData?.category || "");
  const [cityArea, setCityArea] = useState<string>(initialData?.city_area || "");
  const [organizerName, setOrganizerName] = useState<string>(initialData?.organizer_name || "");
  const [organizationName, setOrganizationName] = useState<string>(initialData?.organization_name || "");
  const [venueType, setVenueType] = useState<VenueType>(initialData?.venue_type || "onsite");
  const [venueName, setVenueName] = useState(initialData?.venue_name || "");
  const [venueAddress, setVenueAddress] = useState(initialData?.venue_address || "");
  const [registrationUrl, setRegistrationUrl] = useState(initialData?.registration_url || "");
  
  // Format date_start for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForDateInput = (isoDate?: string | null) => {
    if (!isoDate) return "";
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const [dateStart, setDateStart] = useState(formatForDateInput(initialData?.date_start));
  const [dateEnd, setDateEnd] = useState(formatForDateInput(initialData?.date_end));
  const [timeDisplay, setTimeDisplay] = useState(initialData?.time_display || "06:00 PM - 09:00 PM PKT");
  const [priceType, setPriceType] = useState<PriceType>(initialData?.price_type || "free");
  const [priceAmount, setPriceAmount] = useState<number>(initialData?.price_amount || 0);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tags, setTags] = useState(initialData?.tags ? initialData.tags.join(", ") : "");

  // Admin controls
  const [status, setStatus] = useState<EventStatus>(
    initialData?.status || (role === "admin" ? "approved" : "pending")
  );
  const [featured, setFeatured] = useState<boolean>(initialData?.featured ?? false);
  const [rejectionReason, setRejectionReason] = useState<string>(initialData?.rejection_reason || "");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        const nextUrl = mode === "edit" ? `/my-events` : `/submit-event`;
        router.push(`/auth/login?next=${encodeURIComponent(nextUrl)}`);
      } else {
        setCurrentUser(user);
      }
      setLoadingUser(false);
    });
  }, [router, mode]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugManuallyEdited || mode === "create") {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
    setSlugManuallyEdited(true);
  };

  const regenerateSlug = () => {
    if (title.trim()) {
      setSlug(slugify(title));
      setSlugManuallyEdited(false);
      toast.info("Slug updated from title");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    if (!title.trim() || !category.trim() || !cityArea.trim() || !description.trim() || !venueName.trim() || !dateStart || !registrationUrl.trim()) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    // Validate registration URL — must be a parseable http/https URL
    const isValidHttpUrl = (value: string): boolean => {
      try {
        const parsed = new URL(value.trim());
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    };

    if (!isValidHttpUrl(registrationUrl)) {
      toast.error("Please enter a valid Registration URL starting with https:// or http://");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      const finalSlug = slug.trim() || slugify(title) || `event-${Date.now()}`;

      const tagsArray = tags
        ? tags
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean)
        : [];

      // Determine final status
      let finalStatus: EventStatus = status;
      let finalRejectionReason: string | null = null;

      if (role === "admin") {
        finalStatus = status;
        finalRejectionReason = status === "rejected" ? rejectionReason.trim() || null : null;
      } else {
        // Regular user: Always submitted for approval (pending)
        finalStatus = "pending";
        finalRejectionReason = null;
      }

      const payload: Record<string, any> = {
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        short_description: shortDescription.trim() || null,
        category,
        date_start: new Date(dateStart).toISOString(),
        date_end: dateEnd ? new Date(dateEnd).toISOString() : null,
        time_display: timeDisplay.trim() || null,
        venue_type: venueType,
        venue_name: venueName.trim(),
        venue_address: venueAddress.trim() || venueName.trim(),
        city_area: cityArea.trim(),
        registration_url: registrationUrl.trim(),
        organizer_name: organizerName.trim() || null,
        organization_name: organizationName.trim() || null,
        image_url:
          imageUrl.trim() ||
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        status: finalStatus,
        rejection_reason: finalRejectionReason,
        featured: role === "admin" ? featured : (initialData?.featured ?? false),
        price_type: priceType,
        price_amount: priceType === "free" ? 0 : Number(priceAmount) || 0,
        tags: tagsArray,
        updated_at: new Date().toISOString(),
      };

      if (mode === "create") {
        payload.organizer_id = initialData?.organizer_id || currentUser.id;
        payload.created_at = new Date().toISOString();

        const { data, error } = await supabase
          .from("events")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (role === "admin") {
          toast.success(`Event "${title}" created successfully!`);
        } else {
          toast.success("Event submitted successfully for admin review!");
        }

        if (onSuccess) {
          onSuccess(data as EventItem);
        } else if (redirectPath) {
          router.push(redirectPath);
          router.refresh();
        } else {
          router.push(role === "admin" ? "/admin/events" : "/my-events");
          router.refresh();
        }
      } else {
        // Edit mode
        if (!initialData?.id) {
          throw new Error("Event ID missing for update");
        }

        const { data, error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", initialData.id)
          .select()
          .single();

        if (error) throw error;

        if (role === "admin") {
          toast.success(`"${title}" has been updated.`);
        } else {
          toast.success("Event updated and resubmitted for admin review!");
        }

        if (onSuccess) {
          onSuccess(data as EventItem);
        } else if (redirectPath) {
          router.push(redirectPath);
          router.refresh();
        } else {
          router.push(role === "admin" ? "/admin/events" : "/my-events");
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error("Form error:", err);
      const errMsg = String(err?.message || "");
      if (
        errMsg.includes("organizer_name") ||
        errMsg.includes("organization_name") ||
        errMsg.includes("venue_type")
      ) {
        toast.error(
          "Database migration needed: Please run the SQL file 'supabase/migrations/20260922_add_organizer_and_venue_settings.sql' in your Supabase SQL Editor.",
          { duration: 8000 }
        );
      } else {
        toast.error(err.message || "Failed to save event. Please check inputs.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs font-mono text-[#6B7280]">
          <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-[#111111]">
      {/* User Editing a Rejected Event Alert */}
      {role === "user" && mode === "edit" && initialData?.status === "rejected" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            Previous Moderator Feedback
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed pl-7">
            {initialData.rejection_reason || "The event listing required changes before approval."}
          </p>
          <p className="text-[11px] font-mono text-amber-800 pl-7 pt-1">
            Note: Once you save your revisions below, your event will automatically be resubmitted for review.
          </p>
        </div>
      )}

      {/* Admin Status & Featured Panel (Admins Only) */}
      {role === "admin" && (
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-5 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              Administrative Overrides & Moderation
            </div>
            <span className="text-[10px] font-mono bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
              Admin Powers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Event Listing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none"
              >
                <option value="approved">Approved & Live (Public Directory)</option>
                <option value="pending">Pending Moderation Review</option>
                <option value="archived">Archived (Hidden from Public)</option>
                <option value="rejected">Rejected / Needs Attention</option>
              </select>
              <p className="text-[11px] text-slate-400">
                {status === "approved" && "Visible immediately on Lahore Tech Events public directory and sitemap."}
                {status === "pending" && "Queued in the admin moderation desk."}
                {status === "archived" && "Archived. Hidden from public searches, visible only to admins."}
                {status === "rejected" && "Marked as rejected. Requires moderation feedback."}
              </p>
            </div>

            {/* Featured Switch */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Homepage Featured Spotlight
              </label>
              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-600"
                />
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Sparkles className={`w-4 h-4 ${featured ? "text-amber-400" : "text-slate-500"}`} />
                  <span>Highlight on Homepage Featured Bento</span>
                </div>
              </label>
              <p className="text-[11px] text-slate-400">
                Featured events are pinned at the top of the homepage and events discovery.
              </p>
            </div>
          </div>

          {/* Rejection reason when status is rejected */}
          {status === "rejected" && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                Rejection Note / Feedback to Organizer
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what the organizer needs to modify (e.g. invalid ticket link, low res image)..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* 1. Basic Info */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
          <FileText className="w-4 h-4 text-[#2563EB]" />
          Event Overview
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Lahore AI Summit 2026, Flutter Lahore Meetup"
              className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-sm font-medium focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          {/* URL Slug Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151]">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={regenerateSlug}
                className="text-[11px] font-mono text-[#2563EB] hover:underline"
              >
                Reset from title
              </button>
            </div>
            <div className="flex items-center rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] px-3.5 py-2 text-xs font-mono text-[#6B7280]">
              <span className="text-[#9CA3AF] shrink-0">/events/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={handleSlugChange}
                placeholder="event-slug-here"
                className="w-full bg-transparent text-[#111111] focus:outline-none pl-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Category & City Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. AI & Machine Learning, Web Development, Cloud"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-xs font-medium text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                Lahore Locality / Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={cityArea}
                onChange={(e) => setCityArea(e.target.value)}
                placeholder="e.g. Gulberg, DHA, Johar Town, Model Town"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-xs font-medium text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
              Short Summary / Teaser (Optional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A one-sentence summary shown on event cards and SEO preview"
              className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
              Full Description & Agenda <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the event schedule, key speakers, target audience, prerequisites, and what attendees will learn..."
              className="w-full px-4 py-3 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Machine Learning, Python, Networking, Startups"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Organizer & Host Information */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
          <User className="w-4 h-4 text-[#2563EB]" />
          Organizer & Host Information
        </div>

        <p className="text-xs text-[#6B7280]">
          Add the primary person or organization responsible for hosting this event.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
              Organizer Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g. Salman Ahmad, Community Lead"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">
              Lead contact or community organizer&apos;s name
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
              Organization / Community Name
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. AWS Community Lahore, GDG, PyLahore"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">
              Hosting community, tech club, or company
            </p>
          </div>
        </div>
      </div>

      {/* 3. Schedule & Venue Settings */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
          <Calendar className="w-4 h-4 text-[#2563EB]" />
          Date & Venue Settings
        </div>

        <div className="space-y-5">
          {/* Event Format: Onsite, Online, Hybrid */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-2">
              Event Format <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVenueType("onsite")}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  venueType === "onsite"
                    ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                    : "bg-[#FAFAF8] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Onsite</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVenueType("online");
                  if (!venueName.trim() || venueName === "To Be Announced") {
                    setVenueName("Online Event");
                  }
                  if (!venueAddress.trim() || venueAddress === "To Be Announced") {
                    setVenueAddress("Check Official Event Page");
                  }
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  venueType === "online"
                    ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                    : "bg-[#FAFAF8] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Online</span>
              </button>

              <button
                type="button"
                onClick={() => setVenueType("hybrid")}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  venueType === "hybrid"
                    ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                    : "bg-[#FAFAF8] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Hybrid</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                Start Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-xs font-medium text-[#111111] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                End Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-xs font-medium text-[#111111] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                Time Display String
              </label>
              <input
                type="text"
                value={timeDisplay}
                onChange={(e) => setTimeDisplay(e.target.value)}
                placeholder="06:00 PM - 09:00 PM PKT"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-xs font-medium text-[#111111] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151]">
                  Venue Name <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. NIC Lahore, LUMS, Daftarkhwan, or Online"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#6B7280] font-mono">Presets:</span>
                <button
                  type="button"
                  onClick={() => setVenueName("To Be Announced")}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] border border-[#E5E7EB] transition-colors"
                >
                  + To Be Announced
                </button>
                <button
                  type="button"
                  onClick={() => setVenueName("Check Official Event Page")}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] border border-[#E5E7EB] transition-colors"
                >
                  + Check Event Link Page
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#374151]">
                  Full Venue Address
                </label>
              </div>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g. Sector U, DHA Phase 5, Lahore"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#6B7280] font-mono">Presets:</span>
                <button
                  type="button"
                  onClick={() => setVenueAddress("To Be Announced")}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] border border-[#E5E7EB] transition-colors"
                >
                  + To Be Announced
                </button>
                <button
                  type="button"
                  onClick={() => setVenueAddress("Check Official Event Page")}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] border border-[#E5E7EB] transition-colors"
                >
                  + Check Event Link Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tickets & Registration */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
          <LinkIcon className="w-4 h-4 text-[#2563EB]" />
          Tickets & Registration
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
              Official Registration / Ticketing Link <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://lu.ma/your-event or https://forms.gle/... or Eventbrite link"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] placeholder-[#9CA3AF] text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">
              Users on Lahore Tech Events will be sent directly to this URL to register or purchase tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                Pricing Structure
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPriceType("free");
                    setPriceAmount(0);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-colors ${
                    priceType === "free"
                      ? "bg-[#111111] text-white border-[#111111]"
                      : "bg-[#FAFAF8] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                  }`}
                >
                  Free Event
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType("paid")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-colors ${
                    priceType === "paid"
                      ? "bg-[#111111] text-white border-[#111111]"
                      : "bg-[#FAFAF8] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                  }`}
                >
                  Paid Event
                </button>
              </div>
            </div>

            {priceType === "paid" && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Ticket Price (PKR)
                </label>
                <div className="relative">
                  <span className="text-xs font-mono font-bold text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2">
                    PKR
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value))}
                    placeholder="2500"
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-[#111111] text-xs font-mono font-bold focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Event Poster / Image */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
          <Calendar className="w-4 h-4 text-[#2563EB]" />
          Event Poster Image
        </div>

        <ImageUpload
          value={imageUrl}
          onChange={(url) => setImageUrl(url)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E7EB]">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-xs text-[#4B5563] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
          >
            Cancel
          </button>
        ) : (
          <Link
            href={role === "admin" ? "/admin/events" : "/my-events"}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-xs text-[#4B5563] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#111111] hover:bg-[#2563EB] shadow-md transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Event...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {mode === "create"
                  ? role === "admin"
                    ? "Publish Admin Event"
                    : "Submit Event for Approval"
                  : role === "admin"
                  ? "Update Event Listing"
                  : "Save Changes & Resubmit"}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
