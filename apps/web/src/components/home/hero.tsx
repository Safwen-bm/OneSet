import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { SetModule } from './set-module';

const PERKS = [
  { icon: Truck, title: 'Fast delivery', text: '24h Tunis, 48h elsewhere' },
  { icon: RotateCcw, title: 'Easy returns', text: '14 days, no fee' },
  { icon: ShieldCheck, title: 'Local warranty', text: '2 years, handled in Tunisia' },
];

export function Hero() {
  return (
    <section id="hero-section" data-header-transparent="dark" className="-mt-16 w-full">
      <div className="relative h-[74svh] max-h-[820px] min-h-[440px] w-full overflow-hidden bg-black pt-16 sm:h-[82svh] lg:h-[90svh]">
        <div
          className="absolute inset-0 bg-scroll bg-cover bg-center sm:bg-fixed"
          style={{ backgroundImage: "url('/images/hero-setup.png')" }}
          role="img"
          aria-label="Dark blue gaming setup on the left, light minimal setup on the right"
        />

        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 sm:pb-12 lg:px-14 lg:pb-16">
          <div className="max-w-[38ch] sm:max-w-[42ch] lg:max-w-[46ch]">
            <h1 className="text-display text-white">
              <span className="block">Buy the setup.</span>
              <span className="block text-white/55">Not the parts.</span>
            </h1>
            <p className="mt-4 text-base text-white/75 sm:mt-5 sm:text-lg">
              Mice, boards, panels, sound and seating chosen to sit on the same desk. Order the
              whole thing in one click, or build it piece by piece.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/shop"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-ink transition hover:brightness-110 sm:h-12 sm:w-auto sm:px-7"
              >
                Shop everything
              </Link>
              <Link
                href="#setups"
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-white/30 px-6 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10 sm:h-12 sm:w-auto sm:px-7"
              >
                See ready-made setups
              </Link>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="pointer-events-auto absolute bottom-6 right-6 w-[380px]">
            <SetModule />
          </div>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-8 lg:hidden">
        <SetModule />
      </div>

      <ul className="container grid gap-5 border-b border-hairline py-8 sm:grid-cols-3">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium text-ink">{title}</p>
              <p className="text-micro text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}