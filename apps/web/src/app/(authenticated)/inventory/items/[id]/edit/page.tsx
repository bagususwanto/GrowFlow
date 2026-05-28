import Link from "next/link";
import { EditItemContainer } from "@web/components/items/edit-item-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Edit Item | GrowFlow",
  description: "Edit item catalog configuration.",
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
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href={`/inventory/items/${id}`} title="Back to Item Details">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Item
          </h1>
          <p className="text-sm text-muted-foreground">
            Update item details, adjust safety stock threshold, or assign a category.
          </p>
        </div>
      </div>

      <EditItemContainer id={id} />
    </div>
  );
}
