import type { Metadata, Viewport } from "next";
import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { PrivyProviderClient } from "@/components/auth/PrivyProviderClient";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/error-boundary";

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
    title: "SplitFare",
    startupImage: [
      "/splash-640x1136.png",
      "/splash-750x1334.png",
      "/splash-1125x2436.png",
      "/splash-1242x2208.png",
      "/splash-1536x2048.png",
      "/splash-1668x2224.png",
      "/splash-2048x2732.png"
    ]
  },
  formatDetection: {
    telephone: false
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "SplitFare",
    "apple-mobile-web-app-title": "SplitFare",
    "theme-color": "#020617",
    "msapplication-navbutton-color": "#020617",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-starturl": "/",
    "viewport": "width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, maximum-scale=1, user-scalable=0"
  }
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <QueryProvider>
            <ToastProvider>
              <PrivyProviderClient>
                <ErrorBoundary>
                  <main>{props.children}</main>
                </ErrorBoundary>
              </PrivyProviderClient>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
