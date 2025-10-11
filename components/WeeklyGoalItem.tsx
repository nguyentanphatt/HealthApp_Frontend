import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const WeeklyGoalItem = ({ icon, iconColor, currentIntake, goalIntake, unit }: { icon: string, iconColor: string, currentIntake: number, goalIntake: number, unit?: string }) => {
    return (
        <View className="flex flex-row items-center gap-2">
            <View className="size-10 rounded-full flex items-center justify-center">
                <FontAwesome6 name={icon} size={24} color={iconColor} />
            </View>
            <Text className="text-black text-3xl font-bold">{currentIntake}<Text className="text-black/60 text-xl font-normal"> / {goalIntake} {unit ? unit : ""}</Text></Text>
        </View>
    )
}

export default WeeklyGoalItem