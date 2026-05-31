import React from 'react';
import { useItemLastPrice } from '@web/hooks/use-item-last-price';

interface PriceLoaderProps {
  itemId: string;
  onPriceLoaded: (price: number) => void;
  onReferenceMessage: (msg: string) => void;
}

export function PriceLoader({ itemId, onPriceLoaded, onReferenceMessage }: PriceLoaderProps) {
  const { data, isLoading } = useItemLastPrice(itemId, 'purchase');

  React.useEffect(() => {
    if (isLoading) return;

    if (data?.unitPrice !== undefined && data?.unitPrice !== null) {
      onPriceLoaded(data.unitPrice);
      const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(data.unitPrice);
      onReferenceMessage(`Referensi: ${formattedPrice} (PO terakhir)`);
    } else {
      onReferenceMessage('Belum ada histori harga');
    }
  }, [data, isLoading, itemId, onPriceLoaded, onReferenceMessage]);

  return null;
}
