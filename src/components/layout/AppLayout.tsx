'use client';

import { withAuthGuard } from '@/utils/ProtectedLayout';
import { Header } from './Header';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default withAuthGuard(AppLayout);
