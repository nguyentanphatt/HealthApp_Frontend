import { useAppTheme } from '@/context/appThemeContext';
import { useToastStore } from '@/stores/useToast';
import React from 'react';
import { Text, View } from 'react-native';

const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();
    const { theme } = useAppTheme();

    const getToastStyles = (type: "success" | "error" | "warning" | "info") => {
        switch (type) {
            case "success":
                return {
                    backgroundColor: "#dcfce7",
                };
            case "error":
                return {
                    backgroundColor: "#ffe2e2",
                };
            case "info":
                return {
                    backgroundColor: "#dbeafe",
                };
            case "warning":
                return {
                    backgroundColor: "#fef9c2",
                };
            default:
                return {
                    backgroundColor: theme.colors.card,
                };
        }
    };

    return (
        <View className="absolute top-16 left-0 right-0 px-4 z-50">
            {toasts.map((toast) => {
                const styles = getToastStyles(toast.type);
                return (
                    <View
                        key={toast.id}
                        className="mb-2 px-4 py-5 rounded-lg shadow-md"
                        style={{ backgroundColor: styles.backgroundColor }}
                    >
                        <Text
                            className="text-sm font-medium text-center"
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