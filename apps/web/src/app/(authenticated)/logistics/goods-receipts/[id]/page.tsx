import { GoodsReceiptDetailContainer } from '@web/components/purchasing/goods-receipts/goods-receipt-detail-container';

export const metadata = {
  title: 'Goods Receipt Details | GrowFlow',
  description: 'View goods receipt details and stock mutations.',
};

export default function GoodsReceiptDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <GoodsReceiptDetailContainer />
    </div>
  );
}
