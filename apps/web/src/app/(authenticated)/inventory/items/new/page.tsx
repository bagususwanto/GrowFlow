import Link from "next/link";
import { CreateItemContainer } from "@web/components/items/create-item-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Create Item | GrowFlow",
  description: "Create a new item in the catalog.",
};

interface CreateItemPageProps {
  searchParams: Promise<{
    from?: string;
  }>;
}

export default async function CreateItemPage({ searchParams }: CreateItemPageProps) {
  const { from } = await searchParams;
  const fallbackUrl = from || "/inventory/items";

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href={fallbackUrl} title="Back">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Item
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new item to the master data and set safety stock thresholds.
          </p>
        </div>
      </div>

      <CreateItemContainer />
    </div>
  );
}
