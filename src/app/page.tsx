'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/users?email=${email}`);
    const users = await res.json();

    if (users.length === 0) {
      setError('Invalid credentials');
      return;
    }

    const user = users[0];
    if (user.password !== password) {
      setError('Invalid credentials');
      return;
    }

    useAuthStore.getState().login(user);

    if (user.role === 'admin') {
      router.push('/admin');
    } else if (user.role === 'manager') {
      router.push('/manager');
    } else {
      router.push('/dashboard');
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
        Log In
      </button>
    </form>
  );
}
