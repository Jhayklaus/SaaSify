'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Toaster, toast as baseToast } from 'sonner';
import { useToastStore } from '@/lib/store/useToastStore';

interface ToastOptions {
  id?: string;
  onDismiss?: (toastId: string | number) => void;
  [key: string]: unknown;
}

export const toast = (
  message: ReactNode,
  options: ToastOptions = {},
) => {
  const key = options.id;
  const { has, add, remove } = useToastStore.getState();
  if (key && has(key)) return;
  if (key) add(key);
  baseToast(message, {
    ...options,
    id: key,
    onDismiss: (t: unknown) => {
      options.onDismiss?.(t);
      if (key) remove(key);
    },
  });
};

export function ToastProvider() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return <Toaster position={isMobile ? 'bottom-center' : 'top-center'} />;
}
