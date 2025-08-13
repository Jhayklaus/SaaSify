import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const ROLES = ['admin', 'manager', 'user'] as const;

const idSchema = z.coerce.number().int();

const updateUserSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(ROLES).optional(),
    password: z.string().optional(),
    organizationId: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = idSchema.safeParse(idParam);
  if (!id.success) {
    return NextResponse.json(
      { error: id.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const body = updateUserSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const currentUserRole = request.headers.get('x-user-role');
  if (body.data.role && currentUserRole !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can change roles' },
      { status: 403 }
    );
  }

  const data: z.infer<typeof updateUserSchema> = { ...body.data };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id: id.data },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });
    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = idSchema.safeParse(idParam);
  if (!id.success) {
    return NextResponse.json(
      { error: id.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id: id.data } });
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
