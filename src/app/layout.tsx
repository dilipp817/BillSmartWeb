import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { currentFlavor } from "@/config/flavor";
import { Providers } from "@/components/providers";

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
  title: currentFlavor.appName,
  description: "Restaurant POS System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: currentFlavor.appName,
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={
        {
          "--primary": currentFlavor.theme.primary,
          "--primary-foreground": currentFlavor.theme.primaryForeground,
          "--sidebar-primary": currentFlavor.theme.sidebarPrimary,
          "--sidebar-primary-foreground": currentFlavor.theme.sidebarPrimaryForeground,
        } as React.CSSProperties
      }
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
