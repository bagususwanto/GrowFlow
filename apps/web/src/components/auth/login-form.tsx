'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../ui/button';
import { ApiError } from '@growflow/types';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(data);
      router.push('/');
      router.refresh();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            {...register('email')}
            className="mt-1 block w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            {...register('password')}
            className="mt-1 block w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-sm font-semibold cursor-pointer"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </form>
  );
}
