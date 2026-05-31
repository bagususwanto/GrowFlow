import { EditUserContainer } from "@web/components/users/edit-user-container";
import { BackButton } from "@web/components/ui/back-button";

export const metadata = {
  title: "Edit User | GrowFlow",
  description: "Edit system user details.",
};

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <BackButton fallbackUrl="/administration/users" />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit User
          </h1>
          <p className="text-sm text-muted-foreground">
            Update user information, assign a different role, or manage account status.
          </p>
        </div>
      </div>

      <EditUserContainer id={id} />
    </div>
  );
}
