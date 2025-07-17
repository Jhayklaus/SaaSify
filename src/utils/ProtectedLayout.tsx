'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Role = 'admin' | 'manager' | 'user';

export function withAuthGuard<P>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: Role[]
) {
  const GuardedComponent: React.FC<React.PropsWithChildren<P>> = (props) => {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const init = useAuthStore((s) => s.init);

    useEffect(() => {
      init();
    }, [init]);

    useEffect(() => {
      if (isInitialized && !user) {
        router.push('/'); // Redirect unauthenticated
      }
      if (isInitialized && user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized'); // Redirect unauthorized
      }
    }, [user, router, isInitialized]);

    if (!isInitialized || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
      return <LoadingSpinner />;
    }

    return <WrappedComponent {...props} />;
  };

  return GuardedComponent;
}
