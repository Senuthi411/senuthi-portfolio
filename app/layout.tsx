import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Senuthi Yuhansa — Information Technology Undergraduate',
    template: '%s — Senuthi Yuhansa',
  },
  description:
    "I'm an Information Technology undergraduate interested in learning how technology works, exploring new ideas, developing technical skills, and building practical projects.",
  openGraph: {
    type: 'website',
    siteName: 'Senuthi Yuhansa',
    title: 'Senuthi Yuhansa — Information Technology Undergraduate',
    description:
      "I'm an Information Technology undergraduate interested in learning how technology works, exploring new ideas, developing technical skills, and building practical projects.",
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
