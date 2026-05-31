import { EditPurchaseOrderContainer } from '@web/components/purchasing/purchase-orders/edit-purchase-order-container';

export const metadata = {
  title: 'Edit Purchase Order | GrowFlow',
  description: 'Edit a purchase order.',
};

export default function EditPurchaseOrderPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <EditPurchaseOrderContainer />
    </div>
  );
}


