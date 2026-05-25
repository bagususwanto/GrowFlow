import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-card/50 to-card p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
          Selamat Datang di GrowFlow ERP
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-xl">
          Sistem ERP modular dengan backend NestJS dan frontend Next.js 15. Modul autentikasi,
          monorepo workspace, dan boilerplate database telah berhasil di-setup.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card/40 p-6 backdrop-blur-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Database Status
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold">PostgreSQL</span>
            <span className="text-xs text-emerald-400 font-medium">● Connected</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-6 backdrop-blur-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Backend API
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold">NestJS API</span>
            <span className="text-xs text-emerald-400 font-medium">● Port 3000</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-6 backdrop-blur-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Monorepo Packages
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold">4 Packages</span>
            <span className="text-xs text-primary font-medium">@growflow/*</span>
          </div>
        </div>
      </div>
    </div>
  );
}
