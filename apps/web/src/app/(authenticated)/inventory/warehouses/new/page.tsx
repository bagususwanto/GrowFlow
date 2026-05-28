import Link from "next/link";
import { CreateWarehouseContainer } from "@web/components/warehouses/create-warehouse-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Create Warehouse | GrowFlow",
  description: "Create a new warehouse storage location.",
};

export default function CreateWarehousePage() {
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
            Create Warehouse
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new storage location for inventory management.
          </p>
        </div>
      </div>

      <CreateWarehouseContainer />
    </div>
  );
}
