import { EditRoleContainer } from "@web/components/roles/edit-role-container";
import { BackButton } from "@web/components/ui/back-button";

export const metadata = {
  title: "Edit Role | GrowFlow",
  description: "Edit system role details and permissions.",
};

interface EditRolePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <BackButton fallbackUrl="/administration/roles" />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Role
          </h1>
          <p className="text-sm text-muted-foreground">
            Update role name or manage its assigned permissions.
          </p>
        </div>
      </div>

      <EditRoleContainer id={id} />
    </div>
  );
}
