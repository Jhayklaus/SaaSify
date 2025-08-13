'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useTask, useTaskActivity } from '@/lib/hooks/useTasks';
import { useUsers } from '@/lib/hooks/useUsers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const taskId = Number(params.id);
  const { data: task, isLoading, isError } = useTask(taskId);
  const { data: users } = useUsers();
  const [page, setPage] = useState(1);
  const { data: activity } = useTaskActivity(taskId, page);

  const getAssigneeName = (id: number | undefined) =>
    users?.find((u) => Number(u.id) === Number(id))?.name ?? 'Unknown';

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (isError || !task) {
    return (
      <AdminLayout>
        <p className="text-red-500">Task not found</p>
      </AdminLayout>
    );
  }

  const totalPages = activity ? Math.ceil(activity.total / activity.limit) : 1;

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-4">{task.title}</h2>
      <div className="mb-6 text-sm">
        <p><strong>Assigned To:</strong> {getAssigneeName(task.assignedTo)}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
      </div>
      <h3 className="text-xl font-semibold mb-2">Activity</h3>
      {activity && activity.data.length > 0 ? (
        <div>
          <ul className="mb-4">
            {activity.data.map((log) => (
              <li key={log.id} className="border-b py-2 text-sm">
                <span className="font-medium capitalize">{log.field}</span> changed from {log.oldValue ?? '-'} to {log.newValue ?? '-'} on {new Date(log.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No activity yet.</p>
      )}
    </AdminLayout>
  );
}
