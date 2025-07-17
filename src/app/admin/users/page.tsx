'use client';

import { useDeleteUser, useUsers } from '@/lib/hooks/useUsers';
import { useMemo, useState } from 'react';
import { EditUserModal } from '@/components/modals/EditUserModal';
import AdminLayout from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { SelectFilter } from '@/components/ui/SelectFilter';


const USERS_PER_PAGE = 6;

export default function AdminUsersPage() {
    const { data: users, isLoading, isError } = useUsers();
    const deleteUser = useDeleteUser();

    const [currentPage, setCurrentPage] = useState(1);
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'user'>('all');

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return filterRole === 'all' ? users : users.filter((u) => u.role === filterRole);
    }, [users, filterRole]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(start, start + USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    const [editingUser, setEditingUser] = useState<null | {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'manager' | 'user';
    }>(null);

    const roleOptions = [
        { label: 'All', value: 'all' },
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'User', value: 'user' },
    ];

    type RoleOption = (typeof roleOptions)[number]['value'];



    return (
        <AdminLayout>
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>

            {/* Filter */}
            <div className='mb-4'>
                <SelectFilter<RoleOption >
                    label="Filter by Role"
                    value={filterRole}
                    options={roleOptions}
                    onChange={(val) => {
                        setFilterRole(val as typeof filterRole);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorState message="Error while fetching users." />}

            {paginatedUsers.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Email</th>
                                <th className="text-left p-3">Role</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3 capitalize">{user.role}</td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => deleteUser.mutate(user.id)}
                                            className="text-sm text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() =>
                                                setEditingUser({
                                                    id: user.id,
                                                    name: user.name,
                                                    email: user.email,
                                                    role: user.role,
                                                })
                                            }
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            Edit
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !isLoading && !isError && <p>No users found.</p>
            )}

            {editingUser && (
                <EditUserModal
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    defaultValues={editingUser}
                />
            )}


            {/* Pagination */}
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
        </AdminLayout>


    );


}
