'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/lib/hooks/useRegister';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useRegister();
  const [userName, setUserName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [sector, setSector] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await register(
        userName,
        organizationName,
        sector,
        email,
        phone,
        password,
      );

      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'manager') {
        router.push('/manager');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Registration failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-sm mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Sign Up</h2>
      <input
        type="text"
        className="w-full px-4 py-2 border rounded"
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full px-4 py-2 border rounded"
        placeholder="Organization Name"
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full px-4 py-2 border rounded"
        placeholder="Sector"
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        required
      />
      <input
        type="email"
        className="w-full px-4 py-2 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        className="w-full px-4 py-2 border rounded"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="password"
        className="w-full px-4 py-2 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-primary text-white w-full py-2 rounded hover:bg-primary/90"
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      <p className="text-sm text-center">
        Already have an account?{' '}
        <Link href="/" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
