import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface BentoCardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
    light?: boolean; // If true, simpler white card
}

export function BentoCard({ children, className, light = true, style, ...props }: BentoCardProps) {
    return (
        <View
            className={twMerge(
                "rounded-[2rem] p-6 shadow-sm",
                light ? "bg-white border border-slate-100" : "bg-white", // Default to white card
                className
            )}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
}
