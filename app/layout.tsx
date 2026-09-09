import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gridex.tech"),
  title: "GrideX Energy OS",
  description: "Интелигентна EMS платформа за енергийни обекти, батерии, пазари и SCADA управление.",
  alternates: {
    canonical: "/",
    languages: { bg: "/", en: "/en/" },
  },
  openGraph: {
    title: "GrideX Energy OS",
    description: "Smart control for every watt",
    images: [{ url: "/og.jpg", width: 1672, height: 941, alt: "GrideX Energy OS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GrideX Energy OS",
    description: "Smart control for every watt",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <head>
        <Script src="/gridex-config.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
