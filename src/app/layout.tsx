import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "BidPulse — Live Auction Simulator & CMS",
  description: "Web-based real-time mobile bid simulator with admin CMS controller and automated AI bidding bots.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakartaSans.variable} ${monoFont.variable} dark h-full antialiased`}>
      <head>
        {/* Anti-SEO: Mencegah Google dan mesin pencari lainnya mengindeks halaman ini */}
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="google" content="nositelinkssearchbox" />
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full bg-[#090D16] text-[#F1F5F9] font-sans flex flex-col selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
