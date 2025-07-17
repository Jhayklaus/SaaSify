'use client';

import { withAuthGuard } from '@/utils/ProtectedLayout';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <Header />
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}

export default withAuthGuard(AdminLayout, ['admin']);
