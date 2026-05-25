import React from 'react';
import { Card, CardContent, CardHeader } from '@web/components/ui/card';

interface StatCardProps {
  label: string;
  value: string;
  statusText: string;
  statusClassName?: string;
}

function StatCard({ label, value, statusText, statusClassName }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className={statusClassName ?? 'text-xs font-medium'}>{statusText}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <Card className="bg-linear-to-br from-primary/10 via-card/50 to-card shadow-xl">
        <CardHeader className="pb-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Selamat Datang di GrowFlow ERP
          </h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm max-w-xl">
            Sistem ERP modular dengan backend NestJS dan frontend Next.js 15. Modul autentikasi,
            monorepo workspace, dan boilerplate database telah berhasil di-setup.
          </p>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Database Status"
          value="PostgreSQL"
          statusText="● Connected"
          statusClassName="text-xs text-emerald-400 font-medium"
        />
        <StatCard
          label="Backend API"
          value="NestJS API"
          statusText="● Port 3000"
          statusClassName="text-xs text-emerald-400 font-medium"
        />
        <StatCard
          label="Monorepo Packages"
          value="4 Packages"
          statusText="@growflow/*"
          statusClassName="text-xs text-primary font-medium"
        />
      </div>
    </div>
  );
}
