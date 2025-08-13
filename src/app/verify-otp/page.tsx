'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequestOTP } from '@/lib/hooks/useRequestOTP';
import { useVerifyOTP } from '@/lib/hooks/useVerifyOTP';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { requestOTP } = useRequestOTP();
  const { verifyOTP } = useVerifyOTP();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await requestOTP(email);
      setRequested(true);
    } catch {
      setError('Failed to request OTP');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await verifyOTP(email, otp);
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'manager') {
        router.push('/manager');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Invalid OTP');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Verify OTP</h2>
      {!requested ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <input
            type="email"
            className="w-full px-4 py-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-primary text-white w-full py-2 rounded hover:bg-primary/90"
          >
            Request OTP
          </button>
          <p className="text-sm text-center">
            Back to{' '}
            <Link href="/" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            placeholder="One-Time Password"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-primary text-white w-full py-2 rounded hover:bg-primary/90"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
    </div>
  );
}
