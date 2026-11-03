import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeskBackdrop from "@/components/DeskBackdrop";
import CourseTape from "@/components/CourseTape";
import { SITE_URL } from "@/data/site";
import "./globals.css";

const grotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Options Lab: the honest options course", template: "%s | Options Lab" },
  description:
    "A free options course that starts with the truth: most people lose money. Real mechanics, Greeks, implied volatility, defined-risk strategies with interactive Black-Scholes payoff charts, and risk management.",
  openGraph: {
    title: "Options Lab: the honest options course",
    description: "Most people lose money trading options. This free course starts there.",
    url: SITE_URL,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#090c10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <DeskBackdrop />
        <SiteHeader />
        <CourseTape />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
