import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  shrinkToFit: "no", 
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669"
};

export const metadata: Metadata = {
  title: "Cuanify - Personal Finance Manager",
  description: "Kelola keuangan pribadi Anda dengan mudah dan aman",
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192x192.svg'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Cuanify'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    title: "Cuanify - Personal Finance Manager",
    description: "Kelola keuangan pribadi Anda dengan mudah dan aman",
    siteName: "Cuanify"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#475569" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cuanify" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-manipulation`}
      >
        {children}
      </body>
    </html>
  );
}
