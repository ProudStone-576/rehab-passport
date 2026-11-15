import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Gurmukhi } from "next/font/google";
import "./globals.css";

// Gurmukhi fallback so Punjabi renders the same on every phone and in print.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const gurmukhi = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], weight: ["400", "600", "700"], variable: "--font-gurmukhi", display: "swap" });

export const metadata: Metadata = {
  title: "Rehab Passport",
  description: "A low-cost, QR-assisted home exercise support concept.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101d35",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${gurmukhi.variable}`}>
      <body>{children}</body>
    </html>
  );
}
