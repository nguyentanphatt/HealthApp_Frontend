import { SleepWeekly } from '@/constants/type';
import { useAppTheme } from '@/context/appThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const SleepWeeklyCard = ({ data: propsData }: { data: SleepWeekly }) => {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const actual = propsData;

    const hoursArray = (actual.dailySleep || []).map(d => d.totalHours);
    const maxHours = hoursArray.length ? Math.max(8, ...hoursArray) : 8;
    const barData = actual.dailySleep.map((d) => ({
        value: d.totalHours,
        label: d.dayOfWeek,
        date: d.date,
        hours: d.totalHours,
        frontColor: d.date === actual.longestSleep?.date && d.totalHours > 0 ? '#60a5fa' : (d.totalHours > 0 ? '#93C5FD' : '#e5e7eb'),
    }));

    return (
        <View className=" p-4 rounded-2xl shadow-md w-full" style={{ backgroundColor: theme.colors.card }}>
            <View className="flex-row justify-between items-center mb-3">
                <View>
                    <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Báo cáo giấc ngủ")}</Text>
                </View>
            </View>
            {actual.totalSleepHours === 0 || hoursArray.every(hour => hour === 0) ? (
                <View className='py-2'>
                    <Text className='text-sm text-center' style={{ color: theme.colors.textSecondary }}>
                        {t("Không có dữ liệu hãy thêm dữ liệu giấc ngủ")}
                    </Text>
                </View>
            ) : (
                <>

                    <View className='flex-row justify-between gap-2'>
                        <View className='min-w-[100px] flex-col items-center justify-between rounded-xl p-3' style={{ backgroundColor: theme.colors.redInfoCard }}>
                            <Text className='text-sm text-red-400'>
                                {t("Tổng giờ ngủ")}
                            </Text>
                            <Text className="text-xl font-bold text-red-500">
                                {actual.totalSleepHours.toFixed(1)}h
                            </Text>
                        </View>
                        <View className='min-w-[100px] flex-col items-center justify-between rounded-xl p-3' style={{ backgroundColor: theme.colors.blueInfoCard }}>
                            <Text className='text-blue-400 text-sm'>
                                {t("Giờ ngủ TB")}
                            </Text>
                            <Text className="text-blue-500 text-xl font-bold">
                                {actual.averageBedtime}
                            </Text>
                        </View>
                        <View className='min-w-[100px] flex-col items-center justify-between bg-emerald-50 rounded-xl p-3' style={{ backgroundColor: theme.colors.emeraldInfoCard }}>
                            <Text className='text-emerald-400 text-sm'>
                                {t("Giờ dậy TB")}
                            </Text>
                            <Text className="text-emerald-500 text-xl font-bold">
                                {actual.averageWakeTime}
                            </Text>
                        </View>
                    </View>
                    <View className="my-4">
                        <Text className="font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>{t("Giấc ngủ theo ngày")}</Text>
                        <View className="relative items-center mb-4 rounded-xl p-3" style={{ backgroundColor: theme.colors.secondaryCard }}>
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
                                renderTooltip={(item: any) => (
                                    <View className="rounded-lg shadow-lg p-2" style={{ backgroundColor: theme.colors.secondaryCard }}>
                                        <Text className="text-xs" style={{ color: theme.colors.textPrimary }}>{item.label} • {item.date}</Text>
                                        <Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{(item.hours ?? 0).toFixed(1)}h</Text>
                                    </View>
                                )}
                                xAxisLabelTextStyle={{
                                    color: theme.colors.textSecondary,
                                }}
                                yAxisTextStyle={{
                                    color: theme.colors.textSecondary,
                                }}
                            />
                        </View>
                    </View>

                    <View className="flex gap-1 rounded-xl p-3" style={{ backgroundColor: theme.colors.secondaryCard }}>
                        <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>{t("Giấc ngủ dài nhất")}</Text>
                        <View className="flex-row justify-between mt-1">
                            <Text className="font-semibold text-xl" style={{ color: theme.colors.textPrimary }}>{actual.longestSleep?.date || '-'}</Text>
                            <Text className="text-blue-600 font-semibold text-xl">{(actual.longestSleep?.hours ?? 0).toFixed(1)}h</Text>
                        </View>
                        <Text className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>Từ {actual.longestSleep?.startTime || '--:--'} đến {actual.longestSleep?.endTime || '--:--'}</Text>
                    </View>
                </>
            )}
        </View>
    )
}

export default SleepWeeklyCard