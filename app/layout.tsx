import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import PWAInstallPrompt from './components/Shared/PWAInstallPrompt';
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from './components/Shared/ThemeProvider';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LogicMonitor Deployment Assistant",
  description: "Help estimate the number of LogicMonitor collectors needed for your environment, explore the LogicMonitor API, and more.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Deployment Assistant',
  },
};

export const viewport: Viewport = {
  themeColor: '#040F4B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <ThemeProvider> */}
          {children}
        {/* </ThemeProvider> */}
        <PWAInstallPrompt />
        <Analytics/>
      </body>
    </html>
  );
}
