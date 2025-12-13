import React from 'react';
import { View, ViewProps, SafeAreaView, Platform, StatusBar } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface MobileContainerProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileContainer({ children, className, style, ...props }: MobileContainerProps) {
    return (
        <View
            className={twMerge("flex-1 bg-black", className)}
            style={[{ flex: 1, backgroundColor: '#000000' }, style]}
            {...props}
        >
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <SafeAreaView className="flex-1" style={{ flex: 1 }}>
                {children}
            </SafeAreaView>
        </View>
    );
}
