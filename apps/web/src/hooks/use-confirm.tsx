'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@web/components/ui/dialog';
import { Button } from '@web/components/ui/button';
import { AlertTriangleIcon } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'default';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = React.createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = React.useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setResolveRef({ resolve });
    });
  }, []);

  const handleClose = React.useCallback(() => {
    if (resolveRef) {
      resolveRef.resolve(false);
    }
    setOptions(null);
    setResolveRef(null);
  }, [resolveRef]);

  const handleConfirm = React.useCallback(() => {
    if (resolveRef) {
      resolveRef.resolve(true);
    }
    setOptions(null);
    setResolveRef(null);
  }, [resolveRef]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={options !== null} onOpenChange={(open) => {
        if (!open) handleClose();
      }}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-start gap-4 space-y-0 p-1">
            {options?.variant === 'destructive' && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangleIcon className="h-5 w-5" />
              </div>
            )}
            {options?.variant === 'warning' && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">
                <AlertTriangleIcon className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <DialogTitle>{options?.title}</DialogTitle>
              <DialogDescription className="pt-1 text-muted-foreground text-sm">
                {options?.description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={handleClose}>
              {options?.cancelText || 'Cancel'}
            </Button>
            <Button
              variant={options?.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              autoFocus
            >
              {options?.confirmText || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = React.useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
}
