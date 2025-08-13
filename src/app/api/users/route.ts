import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const ROLES = ['admin', 'manager', 'user'] as const;
// type Role = typeof ROLES[number];

const userQuerySchema = z.object({
  email: z.string().email().optional(),
  organizationId: z.coerce.number().int().optional(),
});

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(ROLES),
  password: z.string().optional(),
  organizationId: z.number().int(),
});

export async function GET(request: Request) {
  const parsed = userQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const { email, organizationId } = parsed.data;

  try {
    const users = await prisma.user.findMany({
      where: {
        ...(email ? { email } : {}),
        ...(organizationId ? { organizationId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = createUserSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const { name, email, role, password, organizationId } = body.data;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword, // optional
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
