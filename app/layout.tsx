import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://technosun-energy-os.sites.openai.com"),
  title: "TechnoSun Energy OS",
  description: "Интелигентна EMS платформа за енергийни обекти, батерии, пазари и SCADA управление.",
  openGraph: {
    title: "TechnoSun Energy OS",
    description: "Smart control for every watt",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "TechnoSun Energy OS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechnoSun Energy OS",
    description: "Smart control for every watt",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
