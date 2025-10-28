import { SleepWeekly } from '@/constants/type'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'

const SleepWeeklyCard = ({ data: propsData }: { data: SleepWeekly }) => {
    const { t } = useTranslation();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; item: SleepWeekly['dailySleep'][number] } | null>(null);
    const actual = propsData;

    const hoursArray = (actual.dailySleep || []).map(d => d.totalHours);
    const maxHours = hoursArray.length ? Math.max(8, ...hoursArray) : 8;
    const barData = actual.dailySleep.map((d) => ({
        value: d.totalHours,
        label: d.dayOfWeek,
        frontColor: d.date === actual.longestSleep?.date && d.totalHours > 0 ? '#60a5fa' : (d.totalHours > 0 ? '#93C5FD' : '#e5e7eb'),
        onPress: (_item: any, _index: number, x: number, y: number) => setTooltip({ x, y, item: d })
    }));

    useEffect(() => {
        if (!tooltip) return;
        const t = setTimeout(() => setTooltip(null), 3000);
        return () => clearTimeout(t);
    }, [tooltip]);

    return (
        <View className="bg-white p-4 rounded-2xl shadow-md w-full">
            {actual.totalSleepHours === 0 ? (
                <View className='flex-1 gap-5'>
                    <Text className="font-bold text-lg text-black">
                        {t("Báo cáo giấc ngủ")}
                    </Text>
                    <Text className='text-gray-500 text-sm text-center'>
                        {t("Không có dữ liệu hãy thêm dữ liệu giấc ngủ")}
                    </Text>
                </View>
            ) : (
                <>
                    <View className="flex-row justify-between items-center mb-3">
                        <View>
                            <Text className="font-bold text-lg text-black">{t("Báo cáo giấc ngủ")}</Text>
                        </View>
                    </View>

                    <View className='flex-row justify-between gap-2'>
                        <View className='min-w-[100px] flex-col items-center justify-between bg-pink-50 rounded-xl p-3'>
                            <Text className='text-pink-500 text-sm'>
                                {t("Tổng giờ ngủ")}
                            </Text>
                            <Text className="text-pink-600 text-xl font-bold">
                                {actual.totalSleepHours.toFixed(1)}h
                            </Text>
                        </View>
                        <View className='min-w-[100px] flex-col items-center justify-between bg-blue-50 rounded-xl p-3'>
                            <Text className='text-blue-500 text-sm'>
                                {t("Giờ ngủ TB")}
                            </Text>
                            <Text className="text-blue-600 text-xl font-bold">
                                {actual.averageBedtime}
                            </Text>
                        </View>
                        <View className='min-w-[100px] flex-col items-center justify-between bg-emerald-50 rounded-xl p-3'>
                            <Text className='text-emerald-500 text-sm'>
                                {t("Giờ dậy TB")}
                            </Text>
                            <Text className="text-emerald-600 text-xl font-bold">
                                {actual.averageWakeTime}
                            </Text>
                        </View>
                    </View>
                    <View className="my-4">
                        <Text className="font-semibold text-black mb-2">{t("Giấc ngủ theo ngày")}</Text>
                        <View className="items-center mb-4 bg-gray-50 rounded-xl p-3">
                            <BarChart
                                data={barData}
                                barWidth={26}
                                spacing={12}
                                hideRules
                                yAxisThickness={0}
                                xAxisThickness={0}
                                noOfSections={3}
                                maxValue={maxHours}
                                barBorderRadius={6}
                                isAnimated
                            />

                            {tooltip && (
                                <View
                                    className="absolute bg-white rounded-lg shadow-lg p-2 border border-gray-200"
                                    style={{ left: tooltip.x + 16, top: tooltip.y - 58 }}
                                >
                                    <Text className="text-gray-700 text-xs">{tooltip.item.dayOfWeek} • {tooltip.item.date}</Text>
                                    <Text className="text-black text-sm font-semibold">{tooltip.item.totalHours.toFixed(1)}h</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="bg-gray-50 flex gap-1 rounded-xl p-3">
                        <Text className="text-gray-700 text-sm">{t("Giấc ngủ dài nhất")}</Text>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-black font-semibold text-xl">{actual.longestSleep?.date || '-'}</Text>
                            <Text className="text-blue-600 font-semibold text-xl">{(actual.longestSleep?.hours ?? 0).toFixed(1)}h</Text>
                        </View>
                        <Text className="text-gray-500 text-sm mt-0.5">Từ {actual.longestSleep?.startTime || '--:--'} đến {actual.longestSleep?.endTime || '--:--'}</Text>
                    </View>
                </>
            )}
        </View>
    )
}

export default SleepWeeklyCard