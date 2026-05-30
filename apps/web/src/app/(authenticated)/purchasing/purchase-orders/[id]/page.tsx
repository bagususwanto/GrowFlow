import { PurchaseOrderDetailContainer } from '@web/components/purchasing/purchase-orders/purchase-order-detail-container';

export const metadata = {
  title: 'Purchase Order Details | GrowFlow',
  description: 'View purchase order details and line items.',
};

export default function PurchaseOrderDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground text-2xl tracking-tight">Purchase Order Details</h1>
        <p className="text-muted-foreground text-sm">
          Track lifecycle progress and actions for this purchase order.
        </p>
      </div>

      <PurchaseOrderDetailContainer />
    </div>
  );
}
