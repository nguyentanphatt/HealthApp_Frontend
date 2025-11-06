import { useAppTheme } from '@/context/appThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';


const WeeklyGoalItem = ({ icon, iconColor, currentIntake, goalIntake, unit }: { icon: string, iconColor: string, currentIntake: number, goalIntake: number, unit?: string }) => {
    const { theme } = useAppTheme();
    return (
        <View className="flex flex-row items-center gap-2">
            <View className="size-10 rounded-full flex items-center justify-center">
                <FontAwesome6 name={icon} size={24} color={iconColor} />
            </View>
            <Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{currentIntake}<Text className="text-lg font-normal" style={{ color: theme.colors.textSecondary }}> / {goalIntake} {unit ? unit : ""}</Text></Text>
        </View>
    )
}

export default WeeklyGoalItem