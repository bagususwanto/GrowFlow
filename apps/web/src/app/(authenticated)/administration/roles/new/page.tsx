import Link from "next/link";
import { CreateRoleContainer } from "@web/components/roles/create-role-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Create Role | GrowFlow",
  description: "Create a new system role.",
};

export default function CreateRolePage() {
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
            Create Role
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new role to the system and define its permissions.
          </p>
        </div>
      </div>

      <CreateRoleContainer />
    </div>
  );
}
