'use client';

import { useEffect } from 'react';
import { Button } from '@web/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
      <div className="w-full max-w-lg space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Module Error Occurred
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Failed to load this dashboard component. Please try again or contact support if the issue persists.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <Alert variant="destructive" className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold uppercase tracking-wider">
              Technical Details
            </AlertTitle>
            <AlertDescription>
              <code className="text-xs font-mono break-all leading-normal">
                {error.message}
              </code>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}
