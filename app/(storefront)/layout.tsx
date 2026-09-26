import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CookieBanner } from '@/components/storefront/cookie-banner';
import { RevealObserver } from '@/components/shared/reveal';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#inhalt"
        className="sr-only z-[60] rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <main id="inhalt" tabIndex={-1} className="flex-1 focus:outline-none focus-visible:ring-0">
        {children}
      </main>
      <Footer />
      <CookieBanner />
      <RevealObserver />
    </div>
  );
}
