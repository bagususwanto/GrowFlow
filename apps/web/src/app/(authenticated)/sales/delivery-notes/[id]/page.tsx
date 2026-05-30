import { DeliveryNoteDetailContainer } from '@web/components/sales/delivery-notes/delivery-note-detail-container';

export const metadata = {
  title: 'Delivery Note Details | GrowFlow',
  description: 'View details of a Delivery Note.',
};

export default function DeliveryNoteDetailPage() {
  return (
    <div className="px-4 lg:px-6">
      <DeliveryNoteDetailContainer />
    </div>
  );
}
