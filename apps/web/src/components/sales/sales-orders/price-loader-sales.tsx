import React from 'react';
import { useItemLastPrice } from '@web/hooks/use-item-last-price';

interface PriceLoaderSalesProps {
  itemId: string;
  onPriceLoaded: (price: number) => void;
  onReferenceMessage: (msg: string) => void;
}

export function PriceLoaderSales({ itemId, onPriceLoaded, onReferenceMessage }: PriceLoaderSalesProps) {
  const { data, isLoading } = useItemLastPrice(itemId, 'sales');

  React.useEffect(() => {
    if (isLoading) return;

    if (data?.unitPrice !== undefined && data?.unitPrice !== null) {
      onPriceLoaded(data.unitPrice);
      const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(data.unitPrice);
      onReferenceMessage(`Referensi: ${formattedPrice} (SO terakhir)`);
    } else {
      onReferenceMessage('Belum ada histori harga');
    }
  }, [data, isLoading, itemId, onPriceLoaded, onReferenceMessage]);

  return null;
}
