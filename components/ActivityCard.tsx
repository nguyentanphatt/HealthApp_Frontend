import { Activity } from '@/constants/type'
import { useAppTheme } from '@/context/appThemeContext'
import { formatDistance } from '@/utils/activityHelper'
import { formatTimeRange } from '@/utils/convertTime'
import { FontAwesome6 } from '@expo/vector-icons'
import { Href, useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TouchableOpacity, View } from 'react-native'

const ActivityCard = ( { activity, index }: { activity: Activity, index: number } ) => {
    const router = useRouter()
    const { t } = useTranslation()
    const { theme } = useAppTheme();
    return (
        <TouchableOpacity key={activity.sessionId || index} onPress={() => router.push(`/activity/history/${activity.sessionId}` as Href)}
            className="rounded-xl p-4 mb-3" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, shadowColor: theme.colors.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="w-3 h-3 bg-blue-500 rounded-full"></View>
                    <Text className="text-base font-medium" style={{ color: theme.colors.textSecondary }}>{formatTimeRange(activity.startTime, activity.endTime)}</Text>
                </View>
                <View className="size-10 flex items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.secondaryCard }}>
                    <FontAwesome6 name="person-running" size={20} color="#19B1FF" />
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>{formatDistance(activity.distanceKm)}</Text>
                <Text className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>{t("Tổng quãng đường")}</Text>
            </View>

            <View className="flex-row justify-between">
                <View className="flex-1 items-center rounded-lg p-3 mx-1" style={{ backgroundColor: theme.colors.secondaryCard }}>
                    <FontAwesome6 name="shoe-prints" size={16} color="#10B981" />
                    <Text className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{t("Bước")}</Text>
                    <Text className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{activity.stepCount || 0}</Text>
                </View>

                <View className="flex-1 items-center rounded-lg p-3 mx-1" style={{ backgroundColor: theme.colors.secondaryCard }}>
                    <FontAwesome6 name="fire" size={16} color="#F59E0B" />
                    <Text className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Kcal</Text>
                    <Text className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{Math.round(activity.kcal || 0)}</Text>
                </View>

                <View className="flex-1 items-center rounded-lg p-3 mx-1" style={{ backgroundColor: theme.colors.secondaryCard }}>
                    <FontAwesome6 name="gauge" size={16} color="#8B5CF6" />
                    <Text className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{t("Tốc độ")}</Text>
                    <Text className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{activity.avgSpeed || 0} km/h</Text>
                </View>
            </View>

            <View className="mt-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>{t("Thời gian hoạt động")}</Text>
                    <Text className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                        {Math.round((activity.activeTime || 0) / 60)} {t("phút")}
                    </Text>
                </View>
                <View className="w-full rounded-full h-2" style={{ backgroundColor: theme.colors.secondaryCard }}>
                    <View
                        className="h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.tint, width: `${Math.min(100, ((activity.activeTime || 0) / 3600) * 20)}%` }}
                    ></View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ActivityCard