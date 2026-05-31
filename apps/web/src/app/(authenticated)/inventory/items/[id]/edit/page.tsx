import { EditItemContainer } from '@web/components/items/edit-item-container';
import { BackButton } from '@web/components/ui/back-button';

export const metadata = {
  title: 'Edit Item | GrowFlow',
  description: 'Edit item catalog configuration.',
};

interface EditItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <BackButton fallbackUrl="/inventory/items" />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Item</h1>
          <p className="text-sm text-muted-foreground">
            Update item details, adjust safety stock threshold, or assign a category.
          </p>
        </div>
      </div>

      <EditItemContainer id={id} />
    </div>
  );
}
