import { EditSalesOrderContainer } from '@web/components/sales/sales-orders/edit-sales-order-container';

export const metadata = {
  title: 'Edit Sales Order | GrowFlow',
  description: 'Edit a Sales Order.',
};

export default function EditSalesOrderPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <EditSalesOrderContainer />
    </div>
  );
}

