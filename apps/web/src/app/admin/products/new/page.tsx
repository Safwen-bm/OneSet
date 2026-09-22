import Link from 'next/link';
import { ProductForm } from '../product-form';

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted transition-colors hover:text-ink">
        ← Products
      </Link>
      <h2 className="mb-8 mt-3 text-heading">New product</h2>
      <ProductForm />
    </div>
  );
}
