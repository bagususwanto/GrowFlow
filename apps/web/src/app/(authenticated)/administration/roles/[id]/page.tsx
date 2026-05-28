import Link from "next/link";
import { RoleDetailContainer } from "@web/components/roles/role-detail-container";
import { Button } from "@web/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const metadata = {
  title: "Role Details | GrowFlow",
  description: "View system role details and permissions.",
};

interface RoleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
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
            Role Details
          </h1>
          <p className="text-sm text-muted-foreground">
            View role properties, assigned permissions list, and update logs.
          </p>
        </div>
      </div>

      <RoleDetailContainer id={id} />
    </div>
  );
}
