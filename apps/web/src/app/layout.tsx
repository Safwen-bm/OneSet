import type { Metadata } from 'next';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { CartDrawer } from '@/components/site/cart-drawer';
import { CompareBar } from '@/components/site/compare-bar';
import { SampleDataNotice } from '@/components/site/sample-data-notice';
import { SessionSync } from '@/components/site/session-sync';
import { Providers } from './providers';
import './globals.css';

const display = { variable: 'font-display-var' };
const body = { variable: 'font-body-var' };

export const metadata: Metadata = {
  title: {
    default: 'OneSet build the whole setup, not a pile of parts',
    template: '%s · OneSet',
  },
  description:
    'Mice, boards, panels, sound and seating that work together. Delivered across Tunisia in 24 hours.',
  openGraph: {
    title: 'OneSet',
    description: 'Build the whole setup, not a pile of parts.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
          >
            Skip to content
          </a>
          <SessionSync />
          <SampleDataNotice />
          <Header />
          <main id="main" className="pt-16">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <CompareBar />
        </Providers>
      </body>
    </html>
  );
}