import { SalesOrderDetailContainer } from '@web/components/sales/sales-orders/sales-order-detail-container';

export const metadata = {
  title: 'Sales Order Details | GrowFlow',
  description: 'View details of a Sales Order.',
};

export default function SalesOrderDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <SalesOrderDetailContainer />
    </div>
  );
}

