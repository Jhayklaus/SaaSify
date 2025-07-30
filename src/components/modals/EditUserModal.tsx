'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useUpdateUser } from '@/lib/hooks/useUsers';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultValues: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
  };
}

export function EditUserModal({ isOpen, onClose, defaultValues }: Props) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues,
  });

  const updateUser = useUpdateUser();

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, defaultValues, reset]);

  type FormValues = {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
  };

  const onSubmit = (values: FormValues) => {
    updateUser.mutate({ ...values, id: defaultValues.id });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
          <DialogTitle className="text-lg font-bold mb-4">Edit User</DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                {...register('name')}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                {...register('email')}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Role</label>
              <select
                {...register('role')}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-sm px-4 py-2 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
