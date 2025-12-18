import { useAppTheme } from '@/context/appThemeContext';
import { useToastStore } from '@/stores/useToast';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const ToastContainer = () => {
    const { toasts } = useToastStore();
    const { theme } = useAppTheme();

    const getToastConfig = (type: "success" | "error" | "warning" | "info") => {
        const backgroundColor = theme.mode === "dark" ? "#1F1F1F" : "#ffffff";
        
        switch (type) {
            case "success":
                return {
                    backgroundColor,
                    icon: "check-circle" as const,
                    iconColor: "#22c55e",
                };
            case "error":
                return {
                    backgroundColor,
                    icon: "circle-xmark" as const,
                    iconColor: "#ef4444",
                };
            case "info":
                return {
                    backgroundColor,
                    icon: "circle-info" as const,
                    iconColor: "#3b82f6",
                };
            case "warning":
                return {
                    backgroundColor,
                    icon: "triangle-exclamation" as const,
                    iconColor: "#f59e0b",
                };
            default:
                return {
                    backgroundColor,
                    icon: "circle-info" as const,
                    iconColor: theme.colors.textPrimary,
                };
        }
    };

    return (
        <View className="absolute top-16 left-0 right-0 px-4 z-50">
            {toasts.map((toast) => {
                const config = getToastConfig(toast.type);
                return (
                    <View
                        key={toast.id}
                        className="mb-2 px-4 py-5 rounded-lg shadow-md flex-row items-center gap-3"
                        style={{ backgroundColor: config.backgroundColor }}
                    >
                        <FontAwesome6 
                            name={config.icon} 
                            size={20} 
                            color={config.iconColor} 
                        />
                        <Text
                            className="text-sm font-medium flex-1"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            {toast.message}
                        </Text>
                    </View>
                );
            })}
        </View>
    )
}

export default ToastContainer