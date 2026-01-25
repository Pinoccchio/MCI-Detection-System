import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { Analytics } from "@vercel/analytics/next";

// Display font for hero headlines - distinctive and bold
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

// Sans-serif for body and headings - clean but distinctive (NOT Inter!)
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon.ico' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MCI Detect',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mci-detection-system.vercel.app',
    title: 'MCI Detection System | Early Alzheimer\'s Detection with AI',
    description: 'Advanced 2D CNN-based medical imaging software for hippocampal analysis and MCI classification.',
    siteName: 'MCI Detection System',
    images: [
      {
        url: '/logo.png',
        width: 500,
        height: 500,
        alt: 'MCI Detection System Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'MCI Detection System',
    description: 'AI-powered early Alzheimer\'s detection through hippocampal analysis',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
        <Analytics />
      </body>
    </html>
  );
}
