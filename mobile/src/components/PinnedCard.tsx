import React from 'react';
import { View, Text } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PinnedCardProps {
    children: React.ReactNode;
    theme?: 'blue' | 'pink' | 'emerald' | 'amber' | 'indigo' | 'violet';
    className?: string;
    showPin?: boolean;
}

export function PinnedCard({ children, theme = 'blue', className, showPin = true }: PinnedCardProps) {
    const themeStyles = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', pinFrom: 'bg-blue-400', pinTo: 'bg-blue-700' },
        pink: { bg: 'bg-pink-50', border: 'border-pink-200', pinFrom: 'bg-pink-400', pinTo: 'bg-pink-700' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', pinFrom: 'bg-emerald-400', pinTo: 'bg-emerald-700' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-200', pinFrom: 'bg-amber-400', pinTo: 'bg-amber-700' },
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', pinFrom: 'bg-indigo-400', pinTo: 'bg-indigo-700' },
        violet: { bg: 'bg-violet-50', border: 'border-violet-200', pinFrom: 'bg-violet-400', pinTo: 'bg-violet-700' },
    };

    const themeColors = {
        blue: { bg: '#eff6ff', border: '#bfdbfe', pin: '#60a5fa' },
        pink: { bg: '#fdf2f8', border: '#fbcfe8', pin: '#f472b6' },
        emerald: { bg: '#ecfdf5', border: '#a7f3d0', pin: '#34d399' },
        amber: { bg: '#fffbeb', border: '#fde68a', pin: '#fbbf24' },
        indigo: { bg: '#eef2ff', border: '#c7d2fe', pin: '#818cf8' },
        violet: { bg: '#f5f3ff', border: '#ddd6fe', pin: '#a78bfa' },
    };

    const t = themeStyles[theme];
    const c = themeColors[theme];

    return (
        <View className="relative">
            {/* Pin */}
            {showPin && (
                <View className="absolute -top-3 left-1/2 -translate-x-3 z-20">
                    <View className={twMerge(
                        "h-6 w-6 rounded-full shadow-lg border border-black/10",
                        t.pinFrom
                    )} style={{ backgroundColor: c.pin }} />
                </View>
            )}

            {/* Card */}
            <View
                className={twMerge(
                    "relative overflow-hidden rounded-[2.5rem] border-2 p-6 shadow-sm",
                    t.bg,
                    t.border,
                    className
                )}
                style={{
                    backgroundColor: c.bg,
                    borderColor: c.border
                }}
            >
                {children}
            </View>
        </View>
    );
}
