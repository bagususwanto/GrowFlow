import Link from 'next/link';
import { EditPartnerContainer } from '@web/components/partners/edit-partner-container';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';

export const metadata = {
  title: 'Edit Partner | GrowFlow',
  description: 'Edit customer or supplier details.',
};

interface EditPartnerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href={`/relations/partners/${id}`} title="Back to Partner Details">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Partner
          </h1>
          <p className="text-sm text-muted-foreground">
            Update partner information, contact details, and address.
          </p>
        </div>
      </div>

      <EditPartnerContainer id={id} />
    </div>
  );
}
