'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';


interface ErrorStateProps {
  message?: string;
  type?: 'error' | 'warning' | 'info';
  retry?: () => void;
}

export const ErrorState = ({ message = 'Something went wrong.', retry, type }: ErrorStateProps) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 text-center h-[69vh] bg-white shadow rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {
        type === 'error' ? (
          <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
        ) : type === 'warning' ? (
          <AlertTriangle className="w-10 h-10 text-yellow-500 mb-4" />
        ) : (
          <Image
            src="/icons/no-results.png"
            alt="Error"
            width={80}
            height={80}
            className="mb-4" />
        )
      }
      <p className="text-lg font-semibold text-gray-700">{message}</p>

      {retry && (
        <button
          onClick={retry}
          className="mt-4 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
        >
          Retry
        </button>
      )}
    </motion.div>
  );
};
