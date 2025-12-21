import React from 'react';
import { View, ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface MobileCardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileCard({ children, className, style, ...props }: MobileCardProps) {
    return (
        <View
            className={twMerge(
                "bg-[#111111] rounded-[2rem] p-6 mb-4 border border-white/10",
                className
            )}
            style={[{
                backgroundColor: '#111111',
                borderRadius: 32,
                padding: 24,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
            }, style]}
            {...props}
        >
            {children}
        </View>
    );
}
