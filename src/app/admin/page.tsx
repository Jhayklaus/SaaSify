'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useUsers } from '@/lib/hooks/useUsers';
import { useTasks } from '@/lib/hooks/useTasks';
import { Users, ListTodo, UserCheck, Clock, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <div className="text-primary bg-primary/10 p-2 rounded-md">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const router = useRouter();
  const actions = [
    { label: 'Add User', icon: <Users />, href: '/admin/users' },
    { label: 'Add Task', icon: <ListTodo />, href: '/admin/tasks' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => router.push(action.href)}
          className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50 transition flex flex-col items-center gap-2"
        >
          <div className="text-primary">{action.icon}</div>
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

function UsersBarChart({ admin, manager, user }: { admin: number; manager: number; user: number }) {
  const data = [
    { role: 'Admin', count: admin },
    { role: 'Manager', count: manager },
    { role: 'User', count: user },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">User Role Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="role" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TaskStatusChart({ completed, inProgress, pending }: { completed: number; inProgress: number; pending: number }) {
  const data = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Pending', value: pending },
  ];
  const COLORS = ['#22c55e', '#3b82f6', '#eab308'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">Task Status Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function AdminDashboard() {
  const { data: users, isLoading: usersLoading, isError: usersError } = useUsers();
  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useTasks();

  const isLoading = usersLoading || tasksLoading;
  const isError = usersError || tasksError;

  const totalUsers = users?.length ?? 0;
  const managerCount = users?.filter((u) => u.role === 'manager').length ?? 0;
  const adminCount = users?.filter((u) => u.role === 'admin').length ?? 0;
  const userCount = users?.filter((u) => u.role === 'user').length ?? 0;

  const completedTasks = tasks?.filter((t) => t.status === 'completed').length ?? 0;
  const inProgressTasks = tasks?.filter((t) => t.status === 'in-progress').length ?? 0;
  const pendingTasks = tasks?.filter((t) => t.status === 'pending').length ?? 0;

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState message="Error while fetching users or tasks." />}

      {!isLoading && !isError && (
        <>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<Users />} title="Total Users" value={totalUsers} />
            <StatCard icon={<UserCheck />} title="Managers" value={managerCount} />
            <StatCard icon={<UserCheck />} title="Regular Users" value={userCount} />
            <StatCard icon={<ListTodo />} title="Completed Tasks" value={completedTasks} />
            <StatCard icon={<RefreshCw />} title="In Progress Tasks" value={inProgressTasks} />
            <StatCard icon={<Clock />} title="Pending Tasks" value={pendingTasks} />
          </div>

          <div>
            <h2 className='text-lg font-semibold mb-4'>Quick Actions</h2>
            <QuickActions />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TaskStatusChart completed={completedTasks} inProgress={inProgressTasks} pending={pendingTasks} />
            <UsersBarChart admin={adminCount} manager={managerCount} user={userCount} />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
