import { SalesInvoiceDetailContainer } from './invoice-detail-container';

export const metadata = {
  title: 'Sales Invoice Details | GrowFlow',
  description: 'View details of a Sales Invoice.',
};

export default function SalesInvoiceDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <SalesInvoiceDetailContainer />
    </div>
  );
}
