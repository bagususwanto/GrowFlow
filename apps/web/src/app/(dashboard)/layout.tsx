import React from 'react';
import Sidebar from '@web/components/layout/sidebar';
import Header from '@web/components/layout/header';
import AuthGuard from '@web/components/auth/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
