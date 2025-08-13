import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthProps {
  password: string;
}

function calculateStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
const labels = ['Very Weak', 'Weak', 'Fair', 'Strong'];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const percent = (strength / 4) * 100;
  return (
    <div className="mt-1" aria-live="polite">
      <div className="h-2 w-full rounded bg-gray-200" aria-hidden="true">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-2 rounded ${colors[strength - 1] || ''}`}
        />
      </div>
      {password && <p className="mt-1 text-xs text-gray-600">Password strength: {labels[strength - 1] || 'Very Weak'}</p>}
    </div>
  );
}
