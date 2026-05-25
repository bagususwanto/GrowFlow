'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@web/stores/auth.store';
import LoginForm from '@web/components/auth/login-form';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-radial from-primary/10 via-background to-background text-foreground p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-radial from-primary/10 via-background to-background text-foreground p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-xl shadow-2xl transition-all hover:border-border/80">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 border border-primary/20">
            <span className="text-2xl font-bold font-sans">G</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
            GrowFlow
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enterprise Resource Planning System
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
