import { CreateGoodsReceiptContainer } from '@web/components/purchasing/goods-receipts/create-goods-receipt-container';

export const metadata = {
  title: 'New Goods Receipt | GrowFlow',
  description: 'Create a new Goods Receipt (GRN).',
};

export default function NewGoodsReceiptPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground text-2xl tracking-tight">Create Goods Receipt (GRN)</h1>
        <p className="text-muted-foreground text-sm">
          Acknowledge physical items received from suppliers.
        </p>
      </div>

      <CreateGoodsReceiptContainer />
    </div>
  );
}
