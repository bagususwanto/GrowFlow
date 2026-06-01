import { PartnerDetailContainer } from '@web/components/partners/partner-detail-container';

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
      <PartnerDetailContainer id={id} />
    </div>
  );
}
