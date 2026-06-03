import type { Metadata } from "next";
import { manrope, jetbrainsMono } from "./fonts";
import "./globals.css";
import MobileGate from "@/components/MobileGate";

export const metadata: Metadata = {
  title: "Lyvio — Performance & Santé",
  description: "Ton tableau de bord santé performance personnalisé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body><MobileGate>{children}</MobileGate></body>
    </html>
  );
}
