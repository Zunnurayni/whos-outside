import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Fonts are loaded via a <link> in <head> (see below) rather than next/font,
// so a restricted build network never blocks compilation. The CSS variables
// --font-body / --font-display are defined in globals.css with real fallbacks.

export const metadata: Metadata = {
  title: "Who's Outside?",
  description: "Find your people. Experience more of life. A social discovery platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Who's Outside?",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#141210",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
