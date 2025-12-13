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
                "bg-white rounded-[2.5rem] p-6 shadow-sm mb-4",
                className
            )}
            style={[{
                backgroundColor: '#ffffff',
                borderRadius: 40,
                padding: 24,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3
            }, style]}
            {...props}
        >
            {children}
        </View>
    );
}
