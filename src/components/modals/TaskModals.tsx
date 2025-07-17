'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/hooks/useTasks';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    users: { id: number; name: string }[];
    initialData?: Partial<Task>;
}

export function TaskModal({ isOpen, onClose, onSave, users, initialData = {} }: Props) {
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState<number | ''>('');
    const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title ?? '');
            setAssignedTo(initialData.assignedTo ?? '');
            setStatus(initialData.status ?? 'pending');
        }
    }, [initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{initialData?.id ? 'Edit Task' : 'Add Task'}</h3>

                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border px-3 py-2 mb-3 rounded"
                />

                <label className="block text-sm font-medium mb-1">Assign To</label>
                <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(Number(e.target.value))}
                    className="w-full border px-3 py-2 mb-3 rounded"
                >
                    <option value="">Select user</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>

                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="w-full border px-3 py-2 mb-3 rounded"
                >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="text-sm text-gray-600">
                        Cancel
                    </button>
                    <button
                        onClick={() =>
                            onSave({
                                id: initialData.id,
                                title,
                                assignedTo: Number(assignedTo),
                                status,
                            })
                        }
                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
