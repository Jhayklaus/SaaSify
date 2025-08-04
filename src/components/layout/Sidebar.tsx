'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  LayoutDashboard,
  Users,
  ListTodo,
  LogOut,
} from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/tasks', label: 'Tasks', icon: ListTodo },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-64 h-screen bg-background shadow p-4 hidden md:block fixed">
      <h2 className="text-lg font-bold mb-6 text-primary">SaaSify</h2>
      <nav className="space-y-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition text-sm',
              pathname === href && 'bg-secondary text-primary font-semibold hover:bg-secondary/80'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-red-100 text-red-500 mt-10 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
