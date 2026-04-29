"use client";

import { ThemeProvider } from "@/lib/theme";
import CursorTrail from "./CursorTrail";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <CursorTrail />
    </ThemeProvider>
  );
}
