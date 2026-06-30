"use client";

import CircleCursor from "@/components/CircleCursor";
import { ThemeProvider } from "@/lib/theme";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <CircleCursor />
      {children}
    </ThemeProvider>
  );
}
