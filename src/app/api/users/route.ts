import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const ROLES = ['admin', 'manager', 'user'] as const;
// type Role = typeof ROLES[number];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') ?? undefined;

  try {
    const users = await prisma.user.findMany({
      where: email ? { email } : undefined,
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
  try {
    const data = await request.json();

    // Basic validation
    const { name, email, role, password } = data;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    if (!ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password, // optional
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
