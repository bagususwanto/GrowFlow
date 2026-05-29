import Link from 'next/link';
import { PartnerDetailContainer } from '@web/components/partners/partner-detail-container';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';

export const metadata = {
  title: 'Partner Details | GrowFlow',
  description: 'View partner details and transaction history.',
};

interface PartnerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/relations/partners" title="Back to Partners">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Partner Details
          </h1>
          <p className="text-sm text-muted-foreground">
            View supplier/customer information and history.
          </p>
        </div>
      </div>

      <PartnerDetailContainer id={id} />
    </div>
  );
}
