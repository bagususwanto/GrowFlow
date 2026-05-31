'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';

export interface BackButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  fallbackUrl: string;
}

export function BackButton({ fallbackUrl, ...props }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there is internal history
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleBack}
      title="Go back"
      {...props}
    >
      <ChevronLeftIcon className="h-4 w-4" />
      <span className="sr-only">Back</span>
    </Button>
  );
}
