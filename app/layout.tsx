import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import PWAInstallPrompt from './components/Shared/PWAInstallPrompt';
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from './components/Shared/ThemeProvider';
import RAGChat from './components/AIChat/AIChat';
import { DeploymentsProvider } from './components/Providers/DeploymentsProvider';
import { AuthProvider } from './contexts/AuthContext';
import AuthErrorBoundary from './components/Shared/AuthErrorBoundary';
import { usePathname } from 'next/navigation';
import RAGChatWrapper from './components/AIChat/RAGChatWrapper';
import { Toaster } from 'react-hot-toast';

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

const toastOptions = {
  duration: 5000,
  style: {
    background: '#fff',
    color: '#363636',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  success: {
    iconTheme: {
      primary: '#059669', // green-600
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #059669',
    },
  },
  error: {
    iconTheme: {
      primary: '#DC2626', // red-600
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #DC2626',
    },
  },
};

export const metadata: Metadata = {
  title: "LM Deployment Assistant",
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
        <AuthProvider>
          {/* <AuthErrorBoundary> */}
            <ThemeProvider>
              <DeploymentsProvider>
                {children}
              </DeploymentsProvider>
            </ThemeProvider>
            <PWAInstallPrompt />
            <Analytics/>
            <RAGChatWrapper />
            <Toaster
              position="top-center"
              toastOptions={toastOptions}
            />
          {/* </AuthErrorBoundary> */}
        </AuthProvider>
      </body>
    </html>
  );
}
