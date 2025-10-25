import { Activity } from '@/constants/type'
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
    return (
        <TouchableOpacity key={activity.sessionId || index} onPress={() => router.push(`/activity/history/${activity.sessionId}` as Href)}
            className="bg-white shadow-lg rounded-xl p-4 mb-3 border border-gray-100"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="w-3 h-3 bg-blue-500 rounded-full"></View>
                    <Text className="text-base text-gray-600 font-medium">{formatTimeRange(activity.startTime, activity.endTime)}</Text>
                </View>
                <View className="bg-blue-50 size-10 flex items-center justify-center rounded-full">
                    <FontAwesome6 name="person-running" size={20} color="#19B1FF" />
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-3xl font-bold text-gray-900">{formatDistance(activity.distanceKm)}</Text>
                <Text className="text-sm text-gray-500 mt-1">{t("Tổng quãng đường")}</Text>
            </View>

            <View className="flex-row justify-between">
                <View className="flex-1 items-center bg-gray-50 rounded-lg p-3 mx-1">
                    <FontAwesome6 name="shoe-prints" size={16} color="#10B981" />
                    <Text className="text-xs text-gray-500 mt-1">{t("Bước")}</Text>
                    <Text className="text-sm font-bold text-gray-900">{activity.stepCount || 0}</Text>
                </View>

                <View className="flex-1 items-center bg-gray-50 rounded-lg p-3 mx-1">
                    <FontAwesome6 name="fire" size={16} color="#F59E0B" />
                    <Text className="text-xs text-gray-500 mt-1">Kcal</Text>
                    <Text className="text-sm font-bold text-gray-900">{Math.round(activity.kcal || 0)}</Text>
                </View>

                <View className="flex-1 items-center bg-gray-50 rounded-lg p-3 mx-1">
                    <FontAwesome6 name="gauge" size={16} color="#8B5CF6" />
                    <Text className="text-xs text-gray-500 mt-1">{t("Tốc độ")}</Text>
                    <Text className="text-sm font-bold text-gray-900">{activity.avgSpeed || 0} km/h</Text>
                </View>
            </View>

            <View className="mt-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs text-gray-500">{t("Thời gian hoạt động")}</Text>
                    <Text className="text-xs font-medium text-gray-700">
                        {Math.round((activity.activeTime || 0) / 60)} {t("phút")}
                    </Text>
                </View>
                <View className="w-full bg-gray-200 rounded-full h-2">
                    <View
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{
                            width: `${Math.min(100, ((activity.activeTime || 0) / 3600) * 20)}%`
                        }}
                    ></View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ActivityCard