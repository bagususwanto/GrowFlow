import Link from "next/link";
import { UsersTable } from "@web/components/users/users-table";
import { Button } from "@web/components/ui/button";
import { PlusIcon } from "lucide-react";

export const metadata = {
  title: "Users Management | GrowFlow",
  description: "Manage system users and their permissions.",
};

export default function UsersPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Users
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage system users, view system roles, and assign permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            render={
              <Link href="/dashboard/users/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add User
              </Link>
            }
          />
        </div>
      </div>

      <UsersTable />
    </div>
  );
}
