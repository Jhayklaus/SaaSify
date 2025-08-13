import { NextResponse } from 'next/server';
import { otpStore, requestRateMap, isRateLimited } from '../otpStore';

const REQUEST_LIMIT = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: Request) {
  try {
    const { email = '' } = await request.json();
    const normalisedEmail = email.trim().toLowerCase();

    if (!normalisedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (isRateLimited(requestRateMap, normalisedEmail, REQUEST_LIMIT, WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(normalisedEmail, {
      code,
      expires: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    console.log(`OTP for ${normalisedEmail}: ${code}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('REQUEST_OTP_ERROR', err);
    return NextResponse.json(
      { error: 'Failed to request OTP' },
      { status: 500 }
    );
  }
}
