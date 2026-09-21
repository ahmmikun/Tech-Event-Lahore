"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "@/components/image-upload";
import { LAHORE_AREAS, EVENT_CATEGORIES } from "@/types/database";
import { slugify } from "@/lib/utils";
import { 
  Send, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Clock,
  Terminal,
  FileText
} from "lucide-react";

export default function SubmitEventPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [cityArea, setCityArea] = useState<string>(LAHORE_AREAS[0]);
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [timeDisplay, setTimeDisplay] = useState("06:00 PM - 09:00 PM PKT");
  const [priceType, setPriceType] = useState<"free" | "paid">("free");
  const [priceAmount, setPriceAmount] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login?next=/submit-event");
      } else {
        setUser(user);
      }
      setLoadingUser(false);
    });
  }, [router]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit an event.");
      return;
    }

    if (!title.trim() || !description.trim() || !venueName.trim() || !dateStart || !registrationUrl.trim()) {
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

      const finalSlug = slug || slugify(title) || `tech-event-${Date.now()}`;

      const tagsArray = tags
        ? tags
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean)
        : [];

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        short_description: shortDescription.trim() || null,
        category,
        date_start: new Date(dateStart).toISOString(),
        time_display: timeDisplay.trim() || null,
        venue_name: venueName.trim(),
        venue_address: venueAddress.trim() || venueName.trim(),
        city_area: cityArea,
        registration_url: registrationUrl.trim(),
        organizer_id: user.id,
        image_url: imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        status: "pending",
        featured: false,
        price_type: priceType,
        price_amount: priceType === "free" ? 0 : Number(priceAmount) || 0,
        tags: tagsArray,
      };

      const { error } = await supabase.from("events").insert(payload);

      if (error) {
        throw error;
      }

      setSubmittedSuccess(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success("Event submitted successfully for review!");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to submit event. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="flex items-center gap-3 text-xs font-mono text-[#6B7280]">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
          <span>Verifying organizer authentication...</span>
        </div>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#FAFAF8]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-[#E5E7EB] text-center space-y-6 shadow-md animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Event Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              Thank you for submitting your event to the Lahore tech community. Our moderators will review the details and external registration link shortly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] text-left text-xs space-y-2">
            <div className="font-mono font-bold text-[#111111] uppercase tracking-wider text-[11px]">
              What happens next?
            </div>
            <p className="text-[#6B7280]">
              1. Verified within 12–24 hours.<br />
              2. Track progress on your organizer dashboard.<br />
              3. Once approved, it appears instantly on the directory and homepage bento grid.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/my-events"
              className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-[#111111] hover:bg-[#2563EB] transition-colors"
            >
              Go to My Submissions
            </Link>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setTitle("");
                setSlug("");
                setDescription("");
                setVenueName("");
                setVenueAddress("");
                setRegistrationUrl("");
              }}
              className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold text-[#111111] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-[#FAFAF8] text-[#111111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-[#E5E7EB] pb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#E5E7EB] text-[#111111] text-xs font-mono tracking-wider shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
            ORGANIZER DESK
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Post a Tech Event in Lahore
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            Submit your hackathon, meetup, summit, or demo day. Free listing with direct link to your external ticketing portal.
          </p>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Basic Info */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
              <FileText className="w-4 h-4 text-[#2563EB]" />
              Event Overview
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore Generative AI Summit & Hackathon"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] focus:border-[#2563EB] focus:outline-none"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                    Lahore Area / Locality *
                  </label>
                  <select
                    value={cityArea}
                    onChange={(e) => setCityArea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] focus:border-[#2563EB] focus:outline-none"
                  >
                    {LAHORE_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Short Tagline / Summary
                </label>
                <input
                  type="text"
                  placeholder="One punchy sentence summarizing the event..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Full Description & Agenda *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Provide comprehensive details: schedule, keynote speakers, prerequisites, attendee guidelines, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 2. Venue & Date Schedule */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              Schedule & Location
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Time Display (e.g. 05:00 PM - 08:00 PM PKT)
                </label>
                <input
                  type="text"
                  placeholder="06:00 PM - 09:00 PM PKT"
                  value={timeDisplay}
                  onChange={(e) => setTimeDisplay(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arfa Software Technology Park, Level 3"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  Full Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 346-B Ferozepur Road, Lahore"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Registration & Ticketing */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
              <LinkIcon className="w-4 h-4 text-[#2563EB]" />
              External Registration & Admission
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                  External Registration Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://luma.com/your-event or https://forms.gle/..."
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                />
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Attendees will be directed here (Google Forms, Luma, Eventbrite, Ticketwala, or company website).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                    Admission Type
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#111111] cursor-pointer">
                      <input
                        type="radio"
                        name="priceType"
                        value="free"
                        checked={priceType === "free"}
                        onChange={() => setPriceType("free")}
                        className="text-[#2563EB]"
                      />
                      Free Entry
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#111111] cursor-pointer">
                      <input
                        type="radio"
                        name="priceType"
                        value="paid"
                        checked={priceType === "paid"}
                        onChange={() => setPriceType("paid")}
                        className="text-[#2563EB]"
                      />
                      Paid / Ticketed
                    </label>
                  </div>
                </div>

                {priceType === "paid" && (
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                      Ticket Price (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="1500"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Cover Poster & Media */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3 text-sm font-bold text-[#111111]">
              <Terminal className="w-4 h-4 text-[#2563EB]" />
              Event Poster & Cover Media
            </div>

            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* 5. Tags & Topics */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] space-y-4 shadow-sm">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#374151] mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="AI, Nextjs, Hackathon, Networking, Founders"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E7EB] text-sm text-[#111111] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-[#111111] hover:bg-[#2563EB] shadow-md transition-all active:scale-98 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Submitting Event...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Event for Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
