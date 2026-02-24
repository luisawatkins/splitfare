import type { Metadata, Viewport } from "next";
import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { PrivyProviderClient } from "@/components/auth/PrivyProviderClient";

export const metadata: Metadata = {
  title: "SplitFare",
  description: "Split fares with friends easily",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SplitFare"
  }
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <PrivyProviderClient>
            <main>{props.children}</main>
          </PrivyProviderClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
