import { EditPurchaseOrderContainer } from '@web/components/purchasing/purchase-orders/edit-purchase-order-container';

export const metadata = {
  title: 'Edit Purchase Order | GrowFlow',
  description: 'Edit a purchase order.',
};

export default function EditPurchaseOrderPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground text-2xl tracking-tight">Edit Purchase Order</h1>
        <p className="text-muted-foreground text-sm">
          Modify the items or pricing details of this draft order.
        </p>
      </div>

      <EditPurchaseOrderContainer />
    </div>
  );
}
