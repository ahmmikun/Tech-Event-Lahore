import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function formatEventDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "EEEE, MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function formatEventShortDate(dateString: string): { month: string; day: string; time: string } {
  try {
    const date = parseISO(dateString);
    return {
      month: format(date, "MMM").toUpperCase(),
      day: format(date, "d"),
      time: format(date, "h:mm a"),
    };
  } catch {
    return { month: "EVENT", day: "01", time: "12:00 PM" };
  }
}

export function formatPrice(type: "free" | "paid", amount: number = 0): string {
  if (type === "free" || amount === 0) {
    return "Free Admission";
  }
  return `PKR ${amount.toLocaleString()}`;
}

export function buildGoogleCalendarUrl(event: {
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  date_start: string;
  date_end?: string | null;
}): string {
  const start = new Date(event.date_start).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = event.date_end
    ? new Date(event.date_end).toISOString().replace(/-|:|\.\d\d\d/g, "")
    : new Date(new Date(event.date_start).getTime() + 3 * 60 * 60 * 1000)
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: `${event.description}\n\nVenue: ${event.venue_name}, ${event.venue_address}`,
    location: `${event.venue_name}, ${event.venue_address}, Lahore`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildWhatsAppShareUrl(title: string, url: string): string {
  const text = `Check out "${title}" in Lahore on Event Finder Lahore:\n${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function buildTwitterShareUrl(title: string, url: string): string {
  const text = `Join "${title}" in Lahore! Found on Event Finder Lahore:`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=LahoreEvents,Lahore`;
}

export function buildLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}
