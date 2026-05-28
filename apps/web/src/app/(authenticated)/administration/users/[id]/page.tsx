import Link from "next/link";
import { UserDetailContainer } from "@web/components/users/user-detail-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "User Details | GrowFlow",
  description: "View system user details.",
};

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

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
            User Details
          </h1>
          <p className="text-sm text-muted-foreground">
            View account information, access role, and update logs.
          </p>
        </div>
      </div>

      <UserDetailContainer id={id} />
    </div>
  );
}
