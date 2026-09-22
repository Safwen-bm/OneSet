import Link from 'next/link';
import { buttonStyles } from '@/lib/button-styles';
import { SetModule } from './set-module';

export function Hero() {
  return (
    <section className="border-b border-hairline">
      <div className="set-grid">
        <div className="container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="text-display">
              Buy the setup,
              <br />
              not the parts.
            </h1>
            <p className="mt-6 max-w-[46ch] text-lg text-muted">
              Mice, boards, panels, sound and seating that were chosen to sit on the same desk.
              Delivered anywhere in Tunisia, usually the next morning.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className={buttonStyles({ size: 'lg' })}>
                Shop everything
              </Link>
              <Link href="#setups" className={buttonStyles({ variant: 'outline', size: 'lg' })}>
                See ready-made setups
              </Link>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-hairline pt-6 text-sm">
              <div>
                <dt className="text-muted">Delivery</dt>
                <dd className="mt-0.5">24 h in Tunis, 48 h elsewhere</dd>
              </div>
              <div>
                <dt className="text-muted">Returns</dt>
                <dd className="mt-0.5">14 days, no restocking fee</dd>
              </div>
              <div>
                <dt className="text-muted">Warranty</dt>
                <dd className="mt-0.5">Two years, handled locally</dd>
              </div>
            </dl>
          </div>

          <SetModule />
        </div>
      </div>
    </section>
  );
}
