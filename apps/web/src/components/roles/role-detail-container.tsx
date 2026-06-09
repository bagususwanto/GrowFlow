'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRole, useDeleteRole } from './use-roles';
import { normalizePermissions } from './columns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Badge } from '@web/components/ui/badge';
import { Skeleton } from '@web/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import { toast } from 'sonner';
import { ApiError } from '@growflow/types';
import { useConfirm } from '@web/hooks/use-confirm';
import { useBreadcrumbLabel } from '@web/hooks/use-breadcrumb-label';
import {
  ShieldIcon,
  CalendarIcon,
  EditIcon,
  Trash2Icon,
  AlertCircleIcon,
  Loader2Icon,
  ClockIcon,
  CheckCircle2Icon,
} from 'lucide-react';

interface RoleDetailContainerProps {
  id: string;
}

export function RoleDetailContainer({ id }: RoleDetailContainerProps) {
  const router = useRouter();
  const { data: role, isLoading, isError, error } = useRole(id);
  const deleteMutation = useDeleteRole();
  const confirm = useConfirm();

  useBreadcrumbLabel(id, role?.name);

  const handleEdit = () => {
    router.push(`/administration/roles/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!role) return;
    const ok = await confirm({
      title: 'Delete Role',
      description: (
        <>
          Are you sure you want to delete role{' '}
          <span className="font-bold">{role.name}</span>?
          This action cannot be undone.
        </>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (ok) {
      try {
        await toast.promise(deleteMutation.mutateAsync(role.id), {
          loading: `Deleting role ${role.name}...`,
          success: `Role ${role.name} deleted successfully`,
          error: 'Failed to delete role',
        });
        router.push('/administration/roles');
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message || 'Failed to delete role');
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !role) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading role</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Could not fetch role details.'}
        </AlertDescription>
      </Alert>
    );
  }

  const permissions = normalizePermissions(role.permissions);
  const isSystemRole = ['superadmin', 'manager', 'sales', 'purchasing', 'warehouse', 'finance'].includes(
    role.name.toLowerCase(),
  );

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-muted/30 pb-6 border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center bg-primary/10 rounded-full w-16 h-16 text-primary border">
              <ShieldIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold capitalize">{role.name}</CardTitle>
              <CardDescription className="text-sm">
                {isSystemRole ? 'System Default Role' : 'Custom User Role'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit} className="h-9">
              <EditIcon className="mr-1.5 w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending || isSystemRole}
              title={isSystemRole ? 'System roles cannot be deleted' : undefined}
              className="h-9"
            >
              {deleteMutation.isPending ? (
                <Loader2Icon className="mr-1.5 w-4 h-4 animate-spin" />
              ) : (
                <Trash2Icon className="mr-1.5 w-4 h-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Permissions List */}
          <div className="sm:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Role Permissions</h3>
              <p className="text-xs text-muted-foreground">Capabilities allowed under this role.</p>
            </div>
            <div className="border rounded-lg p-4 bg-muted/10 min-h-[120px]">
              {permissions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No permissions assigned to this role.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {permissions.map((perm) => (
                    <Badge
                      key={perm}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
                    >
                      <CheckCircle2Icon className="w-3 h-3 text-primary" />
                      {perm}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audit Dates */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Timeline & Logs</h3>
              <p className="text-xs text-muted-foreground">Historical records for this role.</p>
            </div>

            <div className="space-y-3.5 border rounded-lg p-4 bg-muted/10">
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </span>
                <Badge variant={role.isActive ? 'default' : 'destructive'} className="w-fit font-medium">
                  {role.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Created At
                </span>
                <span className="text-sm flex items-center gap-1.5 text-foreground">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(role.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Updated
                </span>
                <span className="text-sm flex items-center gap-1.5 text-foreground">
                  <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(role.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
