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
      <body className="min-h-full bg-[#090D16] text-[#F1F5F9] font-sans flex flex-col selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
