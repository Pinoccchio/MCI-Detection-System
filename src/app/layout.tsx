import type { Metadata } from "next";
import { IBM_Plex_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Serif for headings - medical authority and sophistication
const plexSerif = IBM_Plex_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Sans-serif for body - clarity and readability
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Monospace for technical data
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MCI Detection System | Early Alzheimer's Detection with AI",
  description: "Advanced 2D CNN-based medical imaging software for hippocampal analysis and MCI classification. Supporting early Alzheimer's detection through AI-powered MRI scan analysis.",
  keywords: ["MCI detection", "Alzheimer's", "hippocampal analysis", "medical imaging", "AI diagnosis", "CNN", "neuroimaging"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${plexSerif.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
