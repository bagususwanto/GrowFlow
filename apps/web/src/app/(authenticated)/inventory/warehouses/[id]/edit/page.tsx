import { EditWarehouseContainer } from '@web/components/warehouses/edit-warehouse-container';
import { BackButton } from '@web/components/ui/back-button';

export const metadata = {
  title: 'Edit Warehouse | GrowFlow',
  description: 'Edit warehouse details.',
};

interface EditWarehousePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWarehousePage({ params }: EditWarehousePageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <BackButton fallbackUrl="/inventory/warehouses" />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Warehouse</h1>
          <p className="text-sm text-muted-foreground">
            Update warehouse details and accessibility configurations.
          </p>
        </div>
      </div>

      <EditWarehouseContainer id={id} />
    </div>
  );
}
