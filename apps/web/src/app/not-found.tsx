import Link from 'next/link';
import { buttonStyles } from '@/lib/button-styles';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] max-w-lg flex-col justify-center py-20 text-center">
      <h1 className="text-title">That page is not part of the set</h1>
      <p className="mt-3 text-muted">
        The link is broken or the product moved. The catalog is one click away.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className={buttonStyles({ variant: 'outline' })}>
          Home
        </Link>
        <Link href="/shop" className={buttonStyles()}>
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
