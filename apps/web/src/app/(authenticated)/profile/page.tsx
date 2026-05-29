import { GeneralTab } from "@web/components/profile/general-tab";
import { SecurityTab } from "@web/components/profile/security-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";

export const metadata = {
  title: "My Profile | GrowFlow",
  description: "Manage your account details and security settings.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6 px-4 lg:px-6 max-w-4xl">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground text-2xl tracking-tight">My Profile</h1>
        <p className="text-muted-foreground text-sm">
          Update your profile details and manage your account security.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full space-y-4">
        <TabsList className="border-b border-border bg-transparent p-0 h-auto gap-6 rounded-none w-full justify-start">
          <TabsTrigger
            value="general"
            className="border-b-2 border-transparent px-1 pb-3 pt-2 rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-muted-foreground data-[state=active]:text-foreground"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="border-b-2 border-transparent px-1 pb-3 pt-2 rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium text-muted-foreground data-[state=active]:text-foreground"
          >
            Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
