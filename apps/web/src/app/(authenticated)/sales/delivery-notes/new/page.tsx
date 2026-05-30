import { CreateDeliveryNoteContainer } from '@web/components/sales/delivery-notes/create-delivery-note-container';

export const metadata = {
  title: 'New Delivery Note | GrowFlow',
  description: 'Create a new Delivery Note.',
};

export default function NewDeliveryNotePage() {
  return (
    <div className="px-4 lg:px-6">
      <CreateDeliveryNoteContainer />
    </div>
  );
}
