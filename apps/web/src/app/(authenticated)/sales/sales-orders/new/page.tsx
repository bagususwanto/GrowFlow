import { CreateSalesOrderContainer } from '@web/components/sales/sales-orders/create-sales-order-container';

export const metadata = {
  title: 'New Sales Order | GrowFlow',
  description: 'Create a new Sales Order.',
};

export default function NewSalesOrderPage() {
  return (
    <div className="px-4 lg:px-6">
      <CreateSalesOrderContainer />
    </div>
  );
}
