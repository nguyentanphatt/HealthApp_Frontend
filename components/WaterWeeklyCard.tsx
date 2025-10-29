import { WaterWeekly } from '@/constants/type';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const WaterWeeklyCard = ({ data }: { data: WaterWeekly }) => {
    const { t } = useTranslation();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; item: WaterWeekly['dailyIntake'][number] } | null>(null);

    const maxWater = (() => {
        const arr = (data.dailyIntake || []).map(d => d.totalMl);
        return arr.length ? Math.max(1000, ...arr) : 1000;
    })();

    const barData = data.dailyIntake.map(d => ({
        value: d.totalMl,
        label: d.dayOfWeek,
        date: d.date,
        ml: d.totalMl,
        frontColor: d.totalMl > 0 ? '#60a5fa' : '#e5e7eb',
    }));

    useEffect(() => {
        if (!tooltip) return;
        const t = setTimeout(() => setTooltip(null), 3000);
        return () => clearTimeout(t);
    }, [tooltip]);

    const renderDelta = (label: string, percentage: number) => {
        const isEqual = percentage === 0;
        const up = percentage > 0;
        return (
            <View className='flex-col gap-2'>
                <View className="flex-row items-center gap-1">
                    {!isEqual && (
                        <FontAwesome6 name={up ? 'arrow-up' : 'arrow-down'} size={12} color={up ? 'green' : 'red'} />
                    )}
                    <Text className={`text-sm ${isEqual ? 'text-yellow-600' : (up ? 'text-green-600' : 'text-red-600')} font-semibold`}>
                        {isEqual ? '=' : ''}{!isEqual && up ? '+' : ''}{percentage}%
                    </Text>
                    <Text className="text-gray-500 text-sm ml-1">{label}</Text>
                </View>
            </View>
        )
    }

    const formatWaterAmount = (ml: number) => {
        if (ml >= 1000) {
            return `${(ml / 1000).toFixed(1)}L`;
        }
        return `${ml}ml`;
    }

    return (
        <View className="bg-white p-4 rounded-2xl shadow-md w-full">
            {data.totalWaterIntake === 0 ? (
                <View className='flex-1 gap-5'>
                    <Text className="font-bold text-xl text-black">{t("Báo cáo nước uống")}</Text>
                    <Text className='text-gray-500 text-sm text-center'>
                        {t("Không có dữ liệu hãy thêm dữ liệu nước uống")}
                    </Text>
                </View>
            ) : (
                <>
                    <View className="flex-row justify-between items-center mb-3">
                        <View>
                            <Text className="font-bold text-xl text-black">{t("Báo cáo nước uống")}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-black font-semibold text-base">{formatWaterAmount(data.totalWaterIntake)}</Text>
                            <Text className="text-gray-500 text-xs">{t("Tổng tuần")}</Text>
                        </View>
                    </View>

                    <View className="flex-col gap-2 mb-4">
                        <View className="bg-blue-50 px-3 py-2 rounded-lg">
                            <Text className="text-blue-700 font-semibold">{t("Mục tiêu hiện tại")}: {formatWaterAmount(data.currentGoal)}</Text>
                        </View>
                        <View className="bg-emerald-50 px-3 py-2 rounded-lg">
                            <Text className="text-emerald-700 font-semibold">{t("Ngày có nước")}: {data.daysWithWater}/7 {t("ngày")}</Text>
                        </View>
                        <View className="bg-amber-50 px-3 py-2 rounded-lg">
                            <Text className="text-amber-700 font-semibold">{t("Ngày không có nước")}: {data.daysWithoutWater}/7 {t("ngày")}</Text>
                        </View>
                    </View>

                    <View className='flex-col gap-2 mb-4'>
                        <Text className='font-semibold text-black'>{t("So với tuần trước")}</Text>
                        <View className="flex-row justify-between">
                            {renderDelta(t("Lượng nước"), data.waterDifference.percentage)}
                            {renderDelta(t("Mục tiêu"), data.goalDifference.percentage)}
                        </View>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3 mb-4">
                        <Text className="font-semibold text-black mb-2">{t("Ngày uống nhiều nhất")}</Text>
                        <View className="flex-row justify-between">
                            <View className="flex-1 mr-2">
                                <Text className="text-gray-500">{t("Ngày")}</Text>
                                <Text className="text-black font-semibold">{data.highestDay.dayOfWeek}</Text>
                                <Text className="text-gray-500 text-sm">{data.highestDay.date}</Text>
                            </View>
                            <View className="flex-1 ml-2">
                                <Text className="text-gray-500">{t("Lượng nước")}</Text>
                                <Text className="text-black font-semibold">{formatWaterAmount(data.highestDay.totalMl)}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="font-semibold text-black mb-2">{t("Lượng nước theo ngày")}</Text>
                        <View className="relative items-center bg-gray-50 rounded-xl p-3">
                            <BarChart
                                data={barData}
                                barWidth={24}
                                spacing={12}
                                hideRules
                                yAxisThickness={0}
                                xAxisThickness={0}
                                noOfSections={3}
                                maxValue={maxWater}
                                barBorderRadius={6}
                                isAnimated
                                renderTooltip={(item: any) => (
                                    <View className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                                        <Text className="text-gray-700 text-xs">{item.label} • {item.date}</Text>
                                        <Text className="text-black text-sm font-semibold">{formatWaterAmount(item.ml)}</Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </>
            )}
        </View>
    )
}

export default WaterWeeklyCard
