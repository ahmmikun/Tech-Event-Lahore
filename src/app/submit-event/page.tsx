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
  Sparkles, 
  Send, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Clock
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
  const [timeDisplay, setTimeDisplay] = useState("06:00 PM - 09:00 PM");
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
      toast.error("Please enter a valid External Registration URL starting with https:// or http://");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      const finalSlug = slug || slugify(title) || `event-${Date.now()}`;
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        category,
        city_area: cityArea,
        venue_name: venueName.trim(),
        venue_address: venueAddress.trim() || venueName.trim(),
        registration_url: registrationUrl.trim(),
        date_start: new Date(dateStart).toISOString(),
        time_display: timeDisplay.trim(),
        price_type: priceType,
        price_amount: priceType === "free" ? 0 : Number(priceAmount) || 0,
        image_url: imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        short_description: shortDescription.trim() || description.slice(0, 160),
        description: description.trim(),
        tags: parsedTags,
        organizer_id: user.id,
        status: "pending", // Always pending for admin review
      };

      const { data, error } = await supabase.from("events").insert(payload).select().single();

      if (error) {
        if (error.code === "23505") {
          // Slug unique violation
          const uniqueSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
          payload.slug = uniqueSlug;
          const retry = await supabase.from("events").insert(payload).select().single();
          if (retry.error) throw retry.error;
        } else {
          throw error;
        }
      }

      // Success
      setSubmittedSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success("Event submitted successfully!");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to submit event. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb / Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Organizer Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Post an Event in Lahore
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Submit your event for admin approval. Once approved, it will be published to the Lahore directory with your external registration link.
          </p>
        </div>

        {/* Success Modal / State */}
        {submittedSuccess ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Event Submitted for Review!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you for posting on Event Finder Lahore. Your event has been placed in the moderation queue. Our team reviews submissions to ensure accurate details and working registration links.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/my-events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all"
              >
                <span>Track in My Submissions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  setSubmittedSuccess(false);
                  setTitle("");
                  setSlug("");
                  setDescription("");
                  setShortDescription("");
                  setVenueName("");
                  setRegistrationUrl("");
                  setImageUrl("");
                }}
                className="px-5 py-3 rounded-xl font-bold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Submit Another Event
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-[#0e1424] border border-slate-800 shadow-2xl space-y-8">
            {/* Guidelines Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">Moderation Notice:</span>
                All submissions undergo quick review before publishing. Please ensure your external registration link is active (Ticketwala, Eventbrite, Google Form, or company URL).
              </div>
            </div>

            {/* Section 1: Event Identity */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">
                1. Basic Event Details
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Event Title <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Lahore Tech Summit 2026 or Sufi Night at Alhamra"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Category <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    URL Slug (auto-generated)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="lahore-tech-summit-2026"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Poster Image */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">
                2. Event Poster / Image
              </h3>
              <ImageUpload value={imageUrl} onChange={setImageUrl} />
            </div>

            {/* Section 3: Date, Time & Venue */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">
                3. Date, Time & Lahore Venue
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Event Date <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Time Display (e.g. 06:00 PM - 10:00 PM)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={timeDisplay}
                      onChange={(e) => setTimeDisplay(e.target.value)}
                      placeholder="06:00 PM - 09:30 PM"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Lahore Locality / Area <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={cityArea}
                    onChange={(e) => setCityArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    {LAHORE_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Venue Name <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. Alhamra Arts Council, Hall 1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Full Street Address
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="e.g. 68 Mall Road, Lahore"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Section 4: External Registration Link & Pricing */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">
                4. Registration Link & Tickets
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>External Registration / Ticket URL <span className="text-orange-500">*</span></span>
                  <span className="text-[11px] text-orange-400 font-normal">Attendees click Register & are redirected here</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={registrationUrl}
                    onChange={(e) => setRegistrationUrl(e.target.value)}
                    placeholder="https://ticketwala.pk/... OR https://forms.gle/... OR https://eventbrite.com/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Pricing Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPriceType("free");
                        setPriceAmount(0);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        priceType === "free"
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      Free Admission
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceType("paid")}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        priceType === "paid"
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      Paid / Ticketed
                    </button>
                  </div>
                </div>

                {priceType === "paid" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Ticket Price (PKR)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(Number(e.target.value))}
                        placeholder="1000"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Descriptions & Tags */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">
                5. Descriptions & Tags
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Short Summary (1-2 sentences)
                </label>
                <input
                  type="text"
                  maxLength={180}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A quick, catchy overview shown on cards and search results..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Full Event Description <span className="text-orange-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide schedule, speakers, what attendees should bring, parking info, and details..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. AI, Startups, Networking, Gulberg"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/35 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
              >
                <Send className="w-5 h-5" />
                <span>{submitting ? "Submitting Event..." : "Submit Event for Admin Approval"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
