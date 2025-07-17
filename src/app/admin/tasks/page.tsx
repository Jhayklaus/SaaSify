'use client';

import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, Task } from '@/lib/hooks/useTasks';
import { useUsers } from '@/lib/hooks/useUsers';
import { TaskModal } from '@/components/modals/TaskModals';
import AdminLayout from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SelectFilter } from '@/components/ui/SelectFilter';

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


    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'in-progress':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'completed':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return '';
        }
    };
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

    const filteredTasks = tasks?.filter((task) =>
        filterStatus === 'all' ? true : task.status === filterStatus
    );



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
                    className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700"
                >
                    + Add Task
                </button>
            </div>


            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-red-500">Failed to load tasks.</p>}

            {tasks && tasks.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-3">Title</th>
                                <th className="text-left p-3">Assigned To</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks && filteredTasks.map((task) => (
                                <tr key={task.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{task.title}</td>
                                    <td className="p-3">{getAssigneeName(task.assignedTo)}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(task.status)}`}
                                        >
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => openEditModal(task)}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteTask.mutate(task.id)}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !isLoading && <p>No tasks found.</p>
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
