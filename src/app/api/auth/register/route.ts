import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const {
      userName,
      organizationName,
      sector,
      email = '',
      phone,
      password = '',
    } = await request.json();

    const normalisedEmail = email.trim().toLowerCase();

    if (!userName || !organizationName || !sector || !normalisedEmail || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        sector,
        phone,
      },
    });

    const user = await prisma.user.create({
      data: {
        name: userName,
        email: normalisedEmail,
        role: 'admin',
        password: hashedPassword,
        organizationId: organization.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json(
        { error: 'JWT secret not configured' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (err) {
    console.error('REGISTER_ERROR', err);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
