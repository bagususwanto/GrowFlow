import Link from 'next/link';
import { CreatePartnerContainer } from '@web/components/partners/create-partner-container';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';

export const metadata = {
  title: 'Add Partner | GrowFlow',
  description: 'Create a new customer or supplier.',
};

interface NewPartnerPageProps {
  searchParams: Promise<{
    from?: string;
  }>;
}

export default async function NewPartnerPage({ searchParams }: NewPartnerPageProps) {
  const { from } = await searchParams;
  const fallbackUrl = from || '/partners';

  let title = "Add Partner";
  let description = "Create a new partner profile and details.";
  if (from === "/sales/customers") {
    title = "Add Customer";
    description = "Create a new customer profile and details.";
  } else if (from === "/purchasing/suppliers") {
    title = "Add Supplier";
    description = "Create a new supplier profile and details.";
  }

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
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <CreatePartnerContainer />
    </div>
  );
}
