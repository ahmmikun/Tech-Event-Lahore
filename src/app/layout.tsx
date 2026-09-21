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
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lahore Tech Events — Discover What's Happening in Lahore's Tech Scene",
    template: "%s | Lahore Tech Events",
  },
  description:
    "The central discovery platform for Lahore's tech community. Find hackathons, developer meetups, AI workshops, startup demos, and tech conferences across Gulberg, DHA, Arfa Software Park, and beyond.",
  keywords: [
    "Lahore Tech Events",
    "Lahore Developer Community",
    "Lahore Hackathons",
    "Pakistan Tech Conferences",
    "AI Workshops Lahore",
    "Gulberg Tech Events",
    "Arfa Karim Tower Meetups",
    "LUMS Tech Events",
  ],
  openGraph: {
    title: "Lahore Tech Events — Discover What's Happening in Lahore's Tech Scene",
    description:
      "Find upcoming hackathons, tech conferences, dev meetups, and founder mixers across Lahore with direct registration links.",
    siteName: "Lahore Tech Events",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lahore Tech Events — Discover What's Happening in Lahore's Tech Scene",
    description:
      "Discover verified tech events, workshops, hackathons, and conferences across Lahore.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans flex flex-col selection:bg-blue-600 selection:text-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              color: "#111111",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
