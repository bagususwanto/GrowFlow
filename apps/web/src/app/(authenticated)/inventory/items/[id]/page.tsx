import Link from "next/link";
import { ItemDetailContainer } from "@web/components/items/item-detail-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Item Details | GrowFlow",
  description: "View item classification and safety stock thresholds.",
};

interface ItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/inventory/items" title="Back to Items">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Item Details
          </h1>
          <p className="text-sm text-muted-foreground">
            View item catalog code, category, units, and logs.
          </p>
        </div>
      </div>

      <ItemDetailContainer id={id} />
    </div>
  );
}
