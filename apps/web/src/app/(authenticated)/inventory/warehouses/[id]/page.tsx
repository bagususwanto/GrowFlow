import Link from "next/link";
import { WarehouseDetailContainer } from "@web/components/warehouses/warehouse-detail-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Warehouse Details | GrowFlow",
  description: "View warehouse details.",
};

interface WarehouseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WarehouseDetailPage({ params }: WarehouseDetailPageProps) {
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
            Warehouse Details
          </h1>
          <p className="text-sm text-muted-foreground">
            View storage location configurations, address, and updates history.
          </p>
        </div>
      </div>

      <WarehouseDetailContainer id={id} />
    </div>
  );
}
