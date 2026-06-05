import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
    <html lang="en" className={`h-full vo ${archivo.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col">
        <Script src="/icons.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
