import type { Metadata } from "next";
import { Inter, Playfair_Display, Fraunces } from "next/font/google";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vibe by Swaniki — Curated Events & Unforgettable Gatherings",
  description:
    "A lightweight, premium, AI-powered whitelabel event platform crafted for India's best gatherings, dinners, summits, and salons.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col parchment-bg text-[#0F0F0F] selection:bg-[#FEF0E7] selection:text-[#E8621A]">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
