import Link from "next/link";
import { EditRoleContainer } from "@web/components/roles/edit-role-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

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
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/administration/roles" title="Back to Roles">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
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
