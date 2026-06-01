'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Proactively log the error to console
    console.error('Captured by root error boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="space-y-6 py-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              System Error Occurred
            </h1>
            <p className="text-sm text-muted-foreground">
              An unexpected system error occurred. We apologize for the inconvenience.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && error.message && (
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold uppercase tracking-wider">
                Error Details
              </AlertTitle>
              <AlertDescription>
                <code className="text-xs font-mono break-all leading-normal">
                  {error.message}
                </code>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={() => reset()} className="w-full">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
