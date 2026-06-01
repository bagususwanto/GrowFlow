import { EditPartnerContainer } from '@web/components/partners/edit-partner-container';
import { BackButton } from '@web/components/ui/back-button';

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
        <BackButton fallbackUrl={`/partners/${id}`} />
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
