import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Options Lab — Interactive Options Trading Course",
  description: "Master options trading from zero to strategist with interactive lessons, quizzes, and chart challenges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <ClientProviders>
          {children}
          <footer className="relative z-10 pb-12 text-center">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Built by{" "}
              <a
                href="https://josh-dare.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:brightness-110"
                style={{ color: "var(--text-secondary)" }}
              >
                Akinwale Dare
              </a>
            </p>
          </footer>
        </ClientProviders>
      </body>
    </html>
  );
}
