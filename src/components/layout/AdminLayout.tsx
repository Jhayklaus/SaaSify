'use client';

import { withAuthGuard } from '@/utils/ProtectedLayout';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 flex flex-col right-0 lg:w-[calc(100%-16rem)] lg:ml-64 bg-gray-50">
                <Header />
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}

export default withAuthGuard(AdminLayout, ['admin']);
