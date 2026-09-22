import Link from 'next/link';
import { Logo } from './logo';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'All products' },
      { href: '/categories/mice', label: 'Gaming mice' },
      { href: '/categories/keyboards', label: 'Keyboards' },
      { href: '/categories/monitors', label: 'Monitors' },
      { href: '/shop?onSale=true', label: 'On sale' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Log in' },
      { href: '/register', label: 'Create account' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/account', label: 'Orders' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: '/shop', label: 'Delivery across Tunisia' },
      { href: '/shop', label: '14-day returns' },
      { href: '/shop', label: 'Warranty' },
      { href: '/shop', label: 'Contact' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline bg-surface">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-[34ch] text-sm text-muted">
            Parts that were chosen to sit on the same desk. Delivered across Tunisia in 24 hours.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="mb-3 text-sm font-medium text-ink">{column.title}</h2>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-hairline">
        <div className="container flex flex-col gap-2 py-5 text-micro text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OneSet. A portfolio project, not a real shop.</p>
          <p>Prices in Tunisian dinar. Built with Next.js, NestJS and PostgreSQL.</p>
        </div>
      </div>
    </footer>
  );
}
