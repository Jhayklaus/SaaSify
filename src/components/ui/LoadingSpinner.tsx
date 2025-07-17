'use client';

import { motion } from 'framer-motion';

export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center h-[60vh] w-full bg-white/80 z-50">
            <motion.div
                className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
        </div>
    );
};
