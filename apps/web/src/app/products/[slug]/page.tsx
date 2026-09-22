import { ProductView } from './product-view';

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductView slug={params.slug} />;
}
