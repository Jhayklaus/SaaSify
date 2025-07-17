'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  retry?: () => void;
}

export const ErrorState = ({ message = 'Something went wrong.', retry }: ErrorStateProps) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AlertTriangle className="w-10 h-10 text-red-500 mb-4 animate-bounce" />
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
