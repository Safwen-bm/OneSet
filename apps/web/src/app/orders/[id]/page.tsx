import { OrderView } from './order-view';

export default function OrderPage({ params }: { params: { id: string } }) {
  return <OrderView id={params.id} />;
}
