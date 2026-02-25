import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'outline' | 'success';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
    const styles = {
        default: 'bg-blue-100 text-blue-800 border-blue-200',
        secondary: 'bg-gray-100 text-gray-800 border-gray-200',
        outline: 'bg-transparent text-gray-600 border-gray-300',
        success: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant]} transition-colors`}>
            {children}
        </span>
    );
}
