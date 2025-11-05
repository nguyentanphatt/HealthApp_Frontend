import { ReportData } from '@/constants/type'
import { useAppTheme } from '@/context/appThemeContext'
import { formatDateStatistics } from '@/utils/convertTime'
import { FontAwesome6 } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Href, useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TouchableOpacity, View } from 'react-native'
import ScheduleItem from './ScheduleItem'

const StatisticWeeklyCard = ({data}: {data: ReportData | undefined}) => {
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const router = useRouter();
    AsyncStorage.setItem("statisticDate", formatDateStatistics(data?.currentWeek.weekStart || "", data?.currentWeek.weekEnd || ""));
    return (
        <TouchableOpacity className="rounded-md shadow-md p-4 flex gap-3" style={{ backgroundColor: theme.colors.card }} onPress={() => router.push('/statistic' as Href)}>
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Báo cáo hàng tuần")}</Text>
                    <Text className="text-black/60" style={{ color: theme.colors.textSecondary }}>{formatDateStatistics(data?.currentWeek.weekStart || "", data?.currentWeek.weekEnd || "")}</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={24} color={theme.colors.textPrimary} />
            </View>

            <View className="flex-row justify-between h-auto">
                <View className="flex gap-2.5 max-w-[40%]">
                    <ScheduleItem
                        title={t("Tổng lượng thức ăn tiêu thụ")}
                        current={data?.currentWeek.calories || 0}
                        old={data?.previousWeek.calories || 0}
                        category="calories"
                        percentage={data?.difference.calories.percentage || 0}
                    />
                    <ScheduleItem
                        title={t("Tổng thời gian ngủ trung bình")}
                        current={data?.currentWeek.sleep || 0}
                        old={data?.previousWeek.sleep || 0}
                        category="sleep"
                        percentage={data?.difference.sleep.percentage || 0}
                    />
                </View>
                <View className="h-full w-1" style={{ backgroundColor: theme.colors.border }} />
                <View className="flex gap-2.5 max-w-[40%]">
                    <ScheduleItem
                        title={t("Tổng số bước chân trung bình")}
                        current={data?.currentWeek.steps || 0}
                        old={data?.previousWeek.steps || 0}
                        category="steps"
                        percentage={data?.difference.steps.percentage || 0}
                    />
                    <ScheduleItem
                        title={t("Lượng nuớc uống trung bình")}
                        current={data?.currentWeek.water || 0}
                        old={data?.previousWeek.water || 0}
                        category="water"
                        percentage={data?.difference.water.percentage || 0}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default StatisticWeeklyCard