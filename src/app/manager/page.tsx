'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ManagerLayout from '@/components/layout/ManagerLayout';
import { useTasks, useUpdateTask, useDeleteTask, Task } from '@/lib/hooks/useTasks';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { SelectFilter } from '@/components/ui/SelectFilter';

export default function ManagerPage() {
  const { data: tasks, isLoading, isError } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [view, setView] = useState<'kanban' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('managerView') as 'kanban' | 'table') || 'kanban';
    }
    return 'kanban';
  });

  const toggleView = (v: 'kanban' | 'table') => {
    setView(v);
    if (typeof window !== 'undefined') {
      localStorage.setItem('managerView', v);
    }
  };

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [selected, setSelected] = useState<number[]>([]);

  const filteredTasks = useMemo(() => {
    return tasks?.filter((t) => (filterStatus === 'all' ? true : t.status === filterStatus)) ?? [];
  }, [tasks, filterStatus]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData('taskId', task.id.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: Task['status']) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('taskId'));
    const task = tasks?.find((t) => t.id === id);
    if (task && task.status !== status) {
      updateTask.mutate({ ...task, status });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((s) => s !== id)));
  };

  const deleteSelected = () => {
    selected.forEach((id) => deleteTask.mutate(id));
    setSelected([]);
  };

  const completeSelected = () => {
    selected.forEach((id) => {
      const task = tasks?.find((t) => t.id === id);
      if (task) {
        updateTask.mutate({ ...task, status: 'completed' });
      }
    });
    setSelected([]);
  };

  const statuses: Task['status'][] = ['pending', 'in-progress', 'completed'];

  return (
    <ManagerLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center">
          <SelectFilter
            label="Filter by Status"
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleView('kanban')}
            className={`px-3 py-1 rounded border text-sm ${view === 'kanban' ? 'bg-primary text-white' : ''}`}
          >
            Kanban
          </button>
          <button
            onClick={() => toggleView('table')}
            className={`px-3 py-1 rounded border text-sm ${view === 'table' ? 'bg-primary text-white' : ''}`}
          >
            Table
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <p className="text-red-500">Failed to load tasks.</p>}

      {!isLoading && filteredTasks.length === 0 && <ErrorState message="No data found" />}

      {view === 'kanban' && filteredTasks.length > 0 && (
        <div className="flex gap-4">
          {statuses.map((status) => (
            <div
              key={status}
              className="flex-1 bg-gray-100 p-3 rounded"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <h3 className="capitalize font-medium mb-2">{status}</h3>
              <div className="space-y-2 min-h-[50px]">
                {filteredTasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="p-2 bg-white shadow rounded cursor-move"
                    >
                      <Link href={`/tasks/${task.id}`} className="hover:underline">
                        {task.title}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'table' && filteredTasks.length > 0 && (
        <div className="rounded overflow-hidden bg-white shadow">
          {selected.length > 0 && (
            <div className="p-3 flex gap-2 border-b text-sm">
              <button onClick={completeSelected} className="px-2 py-1 bg-primary text-white rounded">
                Mark Completed
              </button>
              <button onClick={deleteSelected} className="px-2 py-1 bg-red-500 text-white rounded">
                Delete Selected
              </button>
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3"></th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(task.id)}
                      onChange={(e) => handleSelect(task.id, e.target.checked)}
                    />
                  </td>
                  <td className="p-3">
                    <Link href={`/tasks/${task.id}`} className="hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="p-3 capitalize">{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ManagerLayout>
  );
}
