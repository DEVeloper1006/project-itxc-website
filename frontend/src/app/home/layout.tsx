"use client";

import CircleCursor from "@/components/CircleCursor";
import ColorPicker from "@/components/ColorPicker";
import { ThemeProvider } from "@/lib/theme";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ColorPicker />
      <CircleCursor />
      {children}
    </ThemeProvider>
  );
}
