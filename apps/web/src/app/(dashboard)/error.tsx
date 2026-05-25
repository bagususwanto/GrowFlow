'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Proactively log dashboard level errors
    console.error('Captured by dashboard error boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 8.25h.008v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">
          Terjadi Gangguan pada Modul Ini
        </h2>
        
        <p className="mt-3 text-sm text-muted-foreground">
          Gagal memuat komponen halaman dashboard. Coba muat ulang halaman ini atau hubungi admin jika kendala terus berlanjut.
        </p>

        {error.message && (
          <div className="mt-4 rounded-lg bg-muted/80 p-3 text-left border border-border">
            <span className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">Detail Teknis:</span>
            <code className="mt-1 block text-xs text-muted-foreground font-mono break-all leading-normal">
              {error.message}
            </code>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-98"
          >
            Coba Lagi
          </button>
          
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="w-full sm:w-auto rounded-xl border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    </div>
  );
}
