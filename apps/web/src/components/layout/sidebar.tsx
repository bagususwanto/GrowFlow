'use client';

import React from 'react';
import { useAuthStore } from '@web/stores/auth.store';
import { LayoutDashboard, Boxes, ShoppingCart, DollarSign } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuthStore();

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    superadmin: 'Super Admin',
    manager: 'Manager',
    staff: 'Staff',
    finance: 'Finance',
    warehouse: 'Warehouse',
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar p-6 flex flex-col justify-between shrink-0 h-screen">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center space-x-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-md shadow-sidebar-primary/20">
            G
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            GrowFlow
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-6">
          <div>
            <span className="block px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Modul Utama
            </span>
            <div className="space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-medium border border-sidebar-border/30 shadow-xs">
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-sm">Dashboard</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground transition-colors cursor-not-allowed group">
                <Boxes className="h-4 w-4 group-hover:scale-105 transition-transform" />
                <span className="text-sm">Inventory</span>
                <span className="text-[9px] ml-auto px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                  Soon
                </span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground transition-colors cursor-not-allowed group">
                <ShoppingCart className="h-4 w-4 group-hover:scale-105 transition-transform" />
                <span className="text-sm">Purchasing</span>
                <span className="text-[9px] ml-auto px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                  Soon
                </span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground transition-colors cursor-not-allowed group">
                <DollarSign className="h-4 w-4 group-hover:scale-105 transition-transform" />
                <span className="text-sm">Sales</span>
                <span className="text-[9px] ml-auto px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                  Soon
                </span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* User Quick Info */}
      <div className="border-t border-sidebar-border pt-4 flex items-center space-x-3 px-2">
        <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center font-semibold text-sidebar-foreground shadow-xs">
          {initials}
        </div>
        <div className="truncate">
          <div className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</div>
          <div className="text-[10px] text-muted-foreground">{roleLabels[user.role] || user.role}</div>
        </div>
      </div>
    </aside>
  );
}
