import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '../api/fetcher';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface Task {
  id: number;
  title: string;
  assignedTo: number;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface ActivityLog {
  id: number;
  taskId: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export const useTasks = () => {
  const organizationId = useAuthStore((s) => s.user?.organizationId);
  return useQuery<Task[]>({
    queryKey: ['tasks', organizationId],
    queryFn: async () => {
      const response = await fetcher.get('/tasks', {
        params: { organizationId },
      });
      return response.data;
    },
    enabled: !!organizationId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      await fetcher.post('/tasks', task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await fetcher.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Task) => {
      await fetcher.put(`/tasks/${task.id}`, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useTask = (id: number) => {
  return useQuery<Task>({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await fetcher.get(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useTaskActivity = (taskId: number, page = 1) => {
  return useQuery<{ data: ActivityLog[]; page: number; limit: number; total: number }>({
    queryKey: ['task', taskId, 'activity', page],
    queryFn: async () => {
      const response = await fetcher.get(`/tasks/${taskId}/activity`, {
        params: { page },
      });
      return response.data;
    },
    enabled: !!taskId,
  });
};
