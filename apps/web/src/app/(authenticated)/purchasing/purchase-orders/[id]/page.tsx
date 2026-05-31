import { PurchaseOrderDetailContainer } from '@web/components/purchasing/purchase-orders/purchase-order-detail-container';

export const metadata = {
  title: 'Purchase Order Details | GrowFlow',
  description: 'View purchase order details and line items.',
};

export default function PurchaseOrderDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PurchaseOrderDetailContainer />
    </div>
  );
}

