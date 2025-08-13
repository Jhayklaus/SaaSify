'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  useTaskDetail,
  useTaskComments,
  useAddComment,
  useTaskAttachments,
  useUploadAttachment,
  useTaskActivities,
  Attachment,
  Comment,
  Activity,
} from '@/lib/hooks/useTaskDetail';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const taskId = Number(params.id);
  const { data: task } = useTaskDetail(taskId);
  const { data: comments } = useTaskComments(taskId);
  const { mutate: addComment } = useAddComment(taskId);
  const { data: attachments } = useTaskAttachments(taskId);
  const { mutate: uploadAttachment } = useUploadAttachment(taskId);
  const { data: activities } = useTaskActivities(taskId);

  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(commentText);
      setCommentText('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAttachment(file);
    }
  };

  return (
    <AppLayout>
      <h2 className="text-2xl font-semibold mb-4">{task?.title}</h2>
      <p className="mb-6">Status: {task?.status}</p>

      <section className="mb-6">
        <h3 className="font-medium mb-2">Attachments</h3>
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <ul className="list-disc pl-5 space-y-1">
          {attachments?.map((a: Attachment) => (
            <li key={a.id}>
              <a
                href={`data:application/octet-stream;base64,${a.data}`}
                download={a.name}
                className="text-primary hover:underline"
              >
                {a.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="font-medium mb-2">Comments</h3>
        <form onSubmit={handleCommentSubmit} className="mb-2 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 border px-2 py-1 rounded"
            placeholder="Add a comment"
          />
          <button type="submit" className="px-4 py-1 bg-primary text-white rounded">
            Add
          </button>
        </form>
        <ul className="list-disc pl-5 space-y-1">
          {comments?.map((c: Comment) => (
            <li key={c.id}>{c.content}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-medium mb-2">Activity Log</h3>
        <ul className="list-disc pl-5 space-y-1">
          {activities?.map((a: Activity) => (
            <li key={a.id}>
              {a.description} - {new Date(a.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
