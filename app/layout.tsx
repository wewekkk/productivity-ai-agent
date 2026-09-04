import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Quest Agent", description: "Adaptive productivity agent" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
