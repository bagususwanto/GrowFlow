'use client';

import React from 'react';
import { useAuthStore } from '@web/stores/auth.store';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@web/components/ui/avatar';
import { Badge } from '@web/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { LogOut, ChevronDown } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  manager: 'Manager',
  staff: 'Staff',
  finance: 'Finance',
  warehouse: 'Warehouse',
};

function getInitials(name: string | undefined): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const initials = getInitials(user.name);
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-accent transition-colors focus:outline-hidden cursor-pointer"
        render={<button type="button" />}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block text-left">
          <div className="text-xs font-semibold text-foreground">{user.name}</div>
          <div className="text-[10px] text-muted-foreground capitalize">{roleLabel}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-foreground">{user.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          <Badge
            variant="outline"
            className="mt-1.5 text-[10px] text-primary border-primary/30 bg-primary/10"
          >
            {roleLabel}
          </Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleLogout}
            variant="destructive"
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
