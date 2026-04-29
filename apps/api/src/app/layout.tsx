import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "https://bettercanvas.app"),
  title: {
    default: "BetterCanvas",
    template: "%s | BetterCanvas",
  },
  description:
    "A student-first Canvas companion that brings coursework, messaging, planning, and AI tutoring into one focused workspace.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "BetterCanvas",
    description:
      "A student-first Canvas companion that brings coursework, messaging, planning, and AI tutoring into one focused workspace.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterCanvas",
    description:
      "A student-first Canvas companion that brings coursework, messaging, planning, and AI tutoring into one focused workspace.",
    images: ["/og-image.png"],
  },
  other: {
    "theme-color": "#09090d",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} bg-background text-foreground min-h-screen font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
