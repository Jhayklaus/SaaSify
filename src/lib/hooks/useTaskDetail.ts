import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '../api/fetcher';

export interface Attachment {
  id: number;
  name: string;
  data: string;
}

export interface Comment {
  id: number;
  content: string;
}

export interface Activity {
  id: number;
  description: string;
  createdAt: string;
}

export const useTaskDetail = (id: number) =>
  useQuery({
    queryKey: ['task', id],
    queryFn: async () => (await fetcher.get(`/tasks/${id}`)).data,
    enabled: !!id,
  });

export const useTaskComments = (id: number) =>
  useQuery({
    queryKey: ['task', id, 'comments'],
    queryFn: async () => (await fetcher.get(`/tasks/${id}/comments`)).data,
    enabled: !!id,
  });

export const useAddComment = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      await fetcher.post(`/tasks/${id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['task', id, 'activities'] });
    },
  });
};

export const useTaskAttachments = (id: number) =>
  useQuery({
    queryKey: ['task', id, 'attachments'],
    queryFn: async () => (await fetcher.get(`/tasks/${id}/attachments`)).data,
    enabled: !!id,
  });

export const useUploadAttachment = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      await fetcher.post(`/tasks/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id, 'attachments'] });
      queryClient.invalidateQueries({ queryKey: ['task', id, 'activities'] });
    },
  });
};

export const useTaskActivities = (id: number) =>
  useQuery({
    queryKey: ['task', id, 'activities'],
    queryFn: async () => (await fetcher.get(`/tasks/${id}/activities`)).data,
    enabled: !!id,
  });
