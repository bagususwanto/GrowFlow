import Link from "next/link";
import { EditWarehouseContainer } from "@web/components/warehouses/edit-warehouse-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Edit Warehouse | GrowFlow",
  description: "Edit warehouse details.",
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
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/inventory/warehouses" title="Back to Warehouses">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Warehouse
          </h1>
          <p className="text-sm text-muted-foreground">
            Update warehouse details and accessibility configurations.
          </p>
        </div>
      </div>

      <EditWarehouseContainer id={id} />
    </div>
  );
}
