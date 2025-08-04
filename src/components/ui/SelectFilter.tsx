'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Option<T extends string> {
    label: string;
    value: T;
}

interface SelectFilterProps<T extends string> {
    label?: string;
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
    className?: string;
}

export function SelectFilter<T extends string>({
    label,
    value,
    options,
    onChange,
    className,
}: SelectFilterProps<T>) {
    const selected = options.find((opt) => opt.value === value);

    return (
        <div className={clsx('flex flex-col gap-1', className)}>
            {/* <span className="text-sm font-medium text-gray-700">{label}</span> */}
            <Listbox value={value} onChange={onChange}>
                {({ open }) => (
                    <div className="relative w-48">
                        <ListboxButton className="flex items-center justify-between w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-left shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary transition">
                            <span>{!selected?.label ? label : selected?.label}</span>
                            <ChevronDown className="w-5 h-5" />
                        </ListboxButton>

                        <AnimatePresence>
                            {open && (
                                <ListboxOptions
                                    as={motion.ul}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg border border-gray-200 py-1 text-sm max-h-60 overflow-y-auto focus:outline-none"
                                >
                                    {options.map((option) => (
                                        <ListboxOption
                                            key={option.value}
                                            value={option.value}
                                            className={({ active }) =>
                                                clsx(
                                                    'cursor-pointer px-4 py-2',
                                                    active ? 'bg-primary/10 text-primary' : 'text-gray-700'
                                                )
                                            }
                                        >
                                            {({ selected }) => (
                                                <div className="flex items-center justify-between">
                                                    <span>{option.label}</span>
                                                    {selected && <Check className="w-4 h-4 text-primary" />}
                                                </div>
                                            )}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </Listbox>
        </div>
    );
}
