import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email = '', password = '' } = await request.json();
    const normalisedEmail = email.trim().toLowerCase();

    if (!normalisedEmail || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 2️⃣ Explicitly fetch the hashed password
    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
      select: { id: true, email: true, role: true, password: true }, // ⬅️ crucial
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3️⃣ Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password as string);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 4️⃣ Issue the token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!, // make sure this is set in production
      { expiresIn: '1h' }
    );

    // 5️⃣ Never return the hash
    const { ...safeUser } = user; 
    return NextResponse.json({ user: safeUser, token, password: null }, { status: 200 });
  } catch (err) {
    console.error('LOGIN_ERROR', err);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
