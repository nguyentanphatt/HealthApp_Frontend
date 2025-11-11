import { useAppTheme } from '@/context/appThemeContext'
import { FontAwesome6 } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

const ActivityResult = ({ icon, title, result }: {
    icon: string, title: string, result: string
}) => {
    const { theme } = useAppTheme();
    return (
        <View className='flex gap-1'>
            <View className='flex-row items-center gap-1'>
                <FontAwesome6 name={icon} size={24} color="#19B1FF" />
                <Text className='text-lg text-[#19B1FF]'>{title}</Text>
            </View>
            <Text className='text-xl font-bold' style={{ color: theme.colors.textPrimary }}>{result}</Text>
        </View>
    )
}

export default ActivityResult