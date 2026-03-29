import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { NavigationProgress } from "@/components/NavigationProgress";
import { SITE_URL, withCanonicalMetadata } from "@/lib/seo";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = withCanonicalMetadata("/", {
  title: {
    default: "DevTrends - Developer Career Intelligence",
    template: "%s | DevTrends",
  },
  description:
    "Track technology trends across GitHub, Hacker News, Stack Overflow, and job boards. Make smarter career decisions with data-driven insights.",
  keywords: [
    "developer trends",
    "technology tracking",
    "career intelligence",
    "programming languages",
    "tech job market",
    "GitHub trends",
  ],
  authors: [{ name: "DevTrends" }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DevTrends",
    title: "DevTrends - Developer Career Intelligence",
    description:
      "Track technology trends across GitHub, Hacker News, Stack Overflow, and job boards.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevTrends - Developer Career Intelligence",
    description:
      "Track technology trends across GitHub, Hacker News, Stack Overflow, and job boards.",
  },
  verification: {
    google: 'HJZOWekjSh07-2FrEQOHeOUB2Tn05Il_8agggR7fjsg',
  },
  robots: {
    index: true,
    follow: true,
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <NavigationProgress />
          {children}
        </Providers>
      </body>
    </html>
  );
}
