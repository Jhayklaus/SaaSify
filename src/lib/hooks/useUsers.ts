import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '../api/fetcher';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
}

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetcher.get('/users');
      return response.data;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await fetcher.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updated: Partial<User> & { id: number }) => {
      const { id, ...rest } = updated;
      await fetcher.patch(`/users/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export interface CreateUserPayload {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  password?: string;
}

export const useCreateUser = (currentUserRole: 'admin' | 'manager' | 'user') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: CreateUserPayload) => {
      if (currentUserRole !== 'admin') {
        throw new Error('Only admins can create users');
      }
      await fetcher.post('/users', newUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
