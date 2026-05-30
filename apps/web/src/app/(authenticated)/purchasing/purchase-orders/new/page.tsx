import { CreatePurchaseOrderContainer } from '@web/components/purchasing/purchase-orders/create-purchase-order-container';

export const metadata = {
  title: 'New Purchase Order | GrowFlow',
  description: 'Create a new purchase order.',
};

export default function NewPurchaseOrderPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground text-2xl tracking-tight">Create Purchase Order</h1>
        <p className="text-muted-foreground text-sm">
          Draft a new purchase order to request items from a supplier.
        </p>
      </div>

      <CreatePurchaseOrderContainer />
    </div>
  );
}
