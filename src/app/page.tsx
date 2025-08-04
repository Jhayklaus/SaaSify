'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/hooks/useLogin';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await login(email, password);

      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'manager') {
        router.push('/manager');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Invalid credentials');
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Login</h2>
      <input
        type="email"
        className="w-full px-4 py-2 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
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
        {
          loading ? 'Logging in...' : 'Log In'
        }
      </button>
    </form>
  );
}
