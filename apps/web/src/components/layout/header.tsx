'use client';

import React from 'react';
import UserMenu from './user-menu';

export default function Header() {
  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Foundation Phase (Fase 1)
      </h2>
      <div className="flex items-center space-x-6">
        <UserMenu />
      </div>
    </header>
  );
}
