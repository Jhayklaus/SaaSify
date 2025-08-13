import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { otpStore, verifyRateMap, isRateLimited } from '../otpStore';

const VERIFY_LIMIT = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: Request) {
  try {
    const { email = '', otp = '' } = await request.json();
    const normalisedEmail = email.trim().toLowerCase();

    if (!normalisedEmail || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (isRateLimited(verifyRateMap, normalisedEmail, VERIFY_LIMIT, WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many attempts' },
        { status: 429 }
      );
    }

    const record = otpStore.get(normalisedEmail);
    if (!record || record.expires < Date.now() || record.code !== otp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    otpStore.delete(normalisedEmail);

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
        mfa: true,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ user, token }, { status: 200 });
  } catch (err) {
    console.error('VERIFY_OTP_ERROR', err);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
