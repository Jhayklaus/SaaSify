import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const taskId = Number(idParam);
  try {
    const attachments = await prisma.attachment.findMany({ where: { taskId } });
    return NextResponse.json(attachments, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const taskId = Number(idParam);
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const attachment = await prisma.attachment.create({
      data: { taskId, name: file.name, data: base64 },
    });
    await prisma.activity.create({ data: { taskId, description: `Attachment ${file.name} uploaded` } });
    return NextResponse.json(attachment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}
