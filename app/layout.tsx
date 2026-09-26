import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import Script from 'next/script';

import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { getSiteUrl } from '@/lib/site-url';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Häkelwelt';
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} – Handgehäkeltes mit Liebe`,
    template: `%s · ${siteName}`,
  },
  description:
    'Handgehäkelte Unikate, Dekoration und Geschenke. Liebevoll in Deutschland gefertigt, mit Sorgfalt verpackt und versendet.',
  applicationName: siteName,
  keywords: ['Häkeln', 'Handmade', 'Amigurumi', 'Heimdeko', 'Geschenke', 'Wolle'],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName,
    title: `${siteName} – Handgehäkeltes mit Liebe`,
    description: 'Handgehäkelte Unikate, Dekoration und Geschenke aus Deutschland.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3ec' },
    { media: '(prefers-color-scheme: dark)', color: '#231f1c' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/og/default.png`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
        <Script
          id="ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </body>
    </html>
  );
}
