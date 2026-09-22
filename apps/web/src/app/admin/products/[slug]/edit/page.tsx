import { EditProductView } from './edit-view';

export default function EditProductPage({ params }: { params: { slug: string } }) {
  return <EditProductView slug={params.slug} />;
}
