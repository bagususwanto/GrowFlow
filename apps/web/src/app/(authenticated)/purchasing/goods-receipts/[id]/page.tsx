import { GoodsReceiptDetailContainer } from '@web/components/purchasing/goods-receipts/goods-receipt-detail-container';

export const metadata = {
  title: 'Goods Receipt Details | GrowFlow',
  description: 'View goods receipt details and stock mutations.',
};

export default function GoodsReceiptDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground text-2xl tracking-tight">Goods Receipt Details</h1>
        <p className="text-muted-foreground text-sm">
          Verify physical delivery records and confirmation.
        </p>
      </div>

      <GoodsReceiptDetailContainer />
    </div>
  );
}
