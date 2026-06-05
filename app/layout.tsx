import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "VoiceOps — Incident Handler",
  description: "AI-powered incident reporting for Scania production line operators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full vo">
      <body className="min-h-full flex flex-col">
        <Script src="/icons.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
