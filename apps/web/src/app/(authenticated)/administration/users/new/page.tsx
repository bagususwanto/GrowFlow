import Link from "next/link";
import { CreateUserContainer } from "@web/components/users/create-user-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Create User | GrowFlow",
  description: "Create a new system user.",
};

export default function CreateUserPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/administration/users" title="Back to Users">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create User
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new user to the system and configure their role.
          </p>
        </div>
      </div>

      <CreateUserContainer />
    </div>
  );
}
