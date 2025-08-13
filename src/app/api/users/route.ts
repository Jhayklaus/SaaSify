import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { withAuth, AuthRequest } from '@/middleware/withAuth';

const ROLES = ['admin', 'manager', 'user'] as const;

export const GET = withAuth(async (request: AuthRequest) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') ?? undefined;

  try {
    const users = await prisma.user.findMany({
      where: {
        ...(email ? { email } : {}),
        organizationId: request.user.organizationId,
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
}, { roles: ['admin', 'manager'] });

export const POST = withAuth(async (request: AuthRequest) => {
  try {
    const data = await request.json();

    // Basic validation
    const { name, email, role, password, organizationId } = data;

    if (!name || !email || !role || !organizationId) {
      return NextResponse.json(
        { error: 'Name, email, role, and organizationId are required' },
        { status: 400 }
      );
    }

    if (!ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    if (organizationId !== request.user.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
}, { roles: ['admin'] });

