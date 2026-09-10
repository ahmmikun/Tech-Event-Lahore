import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Event Finder Lahore — Discover, Attend & Post Events Across Lahore",
    template: "%s | Event Finder Lahore",
  },
  description:
    "Explore Lahore's vibrant events: Tech conferences, live music & Sufi nights, food festivals, art walks, and comedy gigs in Gulberg, DHA, Johar Town & more.",
  keywords: [
    "Lahore Events",
    "Event Finder Lahore",
    "Concerts in Lahore",
    "Tech Conferences Lahore",
    "Food Festival Lahore",
    "Gulberg Events",
    "DHA Lahore Events",
    "Pakistan Events",
  ],
  openGraph: {
    title: "Event Finder Lahore — Discover, Attend & Post Events Across Lahore",
    description:
      "Find upcoming tech, music, food, and cultural gatherings in the Heart of Pakistan with direct registration links.",
    siteName: "Event Finder Lahore",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Finder Lahore — Discover & Post Events Across Lahore",
    description:
      "Explore upcoming tech conferences, Sufi nights, food fests, and cultural galas across Lahore.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakartaSans.variable} dark`}>
      <body className="min-h-screen bg-[#070a12] text-slate-100 font-sans flex flex-col selection:bg-orange-500 selection:text-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0e1424",
              border: "1px solid rgba(234, 88, 12, 0.3)",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}
