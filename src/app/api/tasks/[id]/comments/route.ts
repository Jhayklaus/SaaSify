import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const taskId = Number(idParam);
  try {
    const comments = await prisma.comment.findMany({ where: { taskId } });
    return NextResponse.json(comments, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const taskId = Number(idParam);
  const data = await request.json();
  try {
    const comment = await prisma.comment.create({ data: { taskId, content: data.content } });
    await prisma.activity.create({ data: { taskId, description: 'Comment added' } });
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
