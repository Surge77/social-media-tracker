import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'DevTrends — Developer Career Intelligence',
    template: '%s | DevTrends',
  },
  description:
    'Track technology trends across GitHub, Hacker News, Stack Overflow, and job boards. Make smarter career decisions with data-driven insights.',
  keywords: [
    'developer trends',
    'technology tracking',
    'career intelligence',
    'programming languages',
    'tech job market',
    'GitHub trends',
  ],
  authors: [{ name: 'DevTrends' }],
  metadataBase: new URL('https://devtrends.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'DevTrends',
    title: 'DevTrends — Developer Career Intelligence',
    description:
      'Track technology trends across GitHub, Hacker News, Stack Overflow, and job boards.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevTrends — Developer Career Intelligence',
    description:
      'Track technology trends across GitHub, Hacker News, Stack Overflow, and job boards.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
