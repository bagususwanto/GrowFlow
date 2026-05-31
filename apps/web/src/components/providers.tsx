'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useAuthStore } from '@web/stores/auth.store';
import { TooltipProvider } from '@web/components/ui/tooltip';
import { ConfirmProvider } from '@web/hooks/use-confirm';
import { Toaster } from '@web/components/ui/sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <ConfirmProvider>
            {children}
            <Toaster />
          </ConfirmProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

