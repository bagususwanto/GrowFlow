'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDeleteUser } from './use-users';
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
  UserIcon,
  MailIcon,
  ShieldIcon,
  CalendarIcon,
  EditIcon,
  Trash2Icon,
  AlertCircleIcon,
  Loader2Icon,
  ClockIcon,
} from 'lucide-react';

interface UserDetailContainerProps {
  id: string;
}

export function UserDetailContainer({ id }: UserDetailContainerProps) {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = useUser(id);
  const deleteMutation = useDeleteUser();
  const confirm = useConfirm();

  useBreadcrumbLabel(id, user?.name);

  const handleEdit = () => {
    router.push(`/administration/users/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!user) return;
    const ok = await confirm({
      title: 'Delete User',
      description: (
        <>
          Are you sure you want to delete user{' '}
          <span className="font-bold">{user.name}</span>?
          This action cannot be undone.
        </>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (ok) {
      try {
        await toast.promise(deleteMutation.mutateAsync(user.id), {
          loading: `Deleting user ${user.name}...`,
          success: `User ${user.name} deleted successfully`,
          error: 'Failed to delete user',
        });
        router.push('/administration/users');
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message || 'Failed to delete user');
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
          <div className="grid gap-6 sm:grid-cols-2 pt-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !user) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading user</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Could not fetch user details.'}
        </AlertDescription>
      </Alert>
    );
  }

  const roleName = user.role?.name || 'staff';
  const isSuperadmin = roleName === 'superadmin';

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-muted/30 pb-6 border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center bg-primary/10 rounded-full w-16 h-16 text-primary border">
              <UserIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-sm">
                <MailIcon className="w-3.5 h-3.5" />
                {user.email}
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
              disabled={deleteMutation.isPending}
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
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Section 1: Account Access details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Access & Role Settings</h3>
              <p className="text-xs text-muted-foreground">
                Assigned permissions group and system level role.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  System Role
                </span>
                <Badge
                  variant={isSuperadmin ? 'default' : 'secondary'}
                  className="flex items-center gap-1 capitalize"
                >
                  <ShieldIcon className="w-3 h-3" />
                  {roleName}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account Status
                </span>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Section 2: Audit Dates */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Timeline & Logs</h3>
              <p className="text-xs text-muted-foreground">
                Account timestamps for creation and history.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Created At
                </span>
                <span className="text-sm flex items-center gap-1.5 text-foreground">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Updated
                </span>
                <span className="text-sm flex items-center gap-1.5 text-foreground">
                  <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
