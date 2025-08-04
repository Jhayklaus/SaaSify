'use client';

import { useMemo, useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, Task } from '@/lib/hooks/useTasks';
import { useUsers } from '@/lib/hooks/useUsers';
import { TaskModal } from '@/components/modals/TaskModals';
import AdminLayout from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SelectFilter } from '@/components/ui/SelectFilter';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminTasksPage() {
    const { data: tasks, isLoading, isError } = useTasks();
    const { data: users } = useUsers();
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);

    const openAddModal = () => {
        setSelectedTask(null);
        setModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setSelectedTask(task);
        setModalOpen(true);
    };

    const handleSave = (task: Partial<Task>) => {
        if (task.id) {
            updateTask.mutate(task as Task);
        } else {
            createTask.mutate(task);
        }
        setModalOpen(false);
    };

    const getAssigneeName = (id: number) =>
        users?.find((u) => Number(u.id) === Number(id))?.name ?? 'Unknown';

    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

    const TASKS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const filteredTasks = useMemo(() => {
        return tasks?.filter((task) =>
            filterStatus === 'all' ? true : task.status === filterStatus
        ) ?? [];
    }, [tasks, filterStatus]);


    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * TASKS_PER_PAGE;
        return filteredTasks.slice(start, start + TASKS_PER_PAGE);
    }, [filteredTasks, currentPage]);

    const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);




    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
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
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-primary cursor-pointer text-white px-4 py-2 text-sm rounded hover:bg-primary/90 transition"
                >
                    + Add Task
                </button>
            </div>


            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-red-500">Failed to load tasks.</p>}

            {paginatedTasks.length > 0 ? (
                <div className="rounded overflow-hidden bg-white shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="text-left p-3">Title</th>
                                <th className="text-left p-3">Assigned To</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTasks.map((task) => (
                                <tr key={task.id} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="p-3">{task.title}</td>
                                    <td className="p-3">{getAssigneeName(task.assignedTo)}</td>
                                    <td className="p-3 capitalize">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300">
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => openEditModal(task)}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            <SquarePenIcon className="inline w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteTask.mutate(task.id)}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            <Trash2Icon className="inline w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !isLoading && <ErrorState  message="No data found" />
            )}

            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center text-sm">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}



            <TaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                users={users ?? []}
                initialData={selectedTask ?? {}}
            />
        </AdminLayout>
    );
}
