import { WorkoutWeekly } from '@/constants/type';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const WorkoutWeeklyCard = ({ data }: { data: WorkoutWeekly }) => {
    const { t } = useTranslation();
    const [stepTip, setStepTip] = useState<{ x: number; y: number; item: WorkoutWeekly['dailySteps'][number] } | null>(null);
    const [calTip, setCalTip] = useState<{ x: number; y: number; item: WorkoutWeekly['dailyCalories'][number] } | null>(null);

    const maxSteps = (() => {
        const arr = (data.dailySteps || []).map(d => d.totalSteps);
        return arr.length ? Math.max(300, ...arr) : 300;
    })();
    const maxCalories = (() => {
        const arr = (data.dailyCalories || []).map(d => d.totalCalories);
        return arr.length ? Math.max(100, ...arr) : 100;
    })();

    const stepsBar = data.dailySteps.map(d => ({
        value: d.totalSteps,
        label: d.dayOfWeek,
        frontColor: d.totalSteps > 0 ? '#34d399' : '#e5e7eb',
        onPress: (_it: any, _idx: number, x: number, y: number) => setStepTip({ x, y, item: d })
    }));
    const caloriesBar = data.dailyCalories.map(d => ({
        value: d.totalCalories,
        label: d.dayOfWeek,
        frontColor: d.totalCalories > 0 ? '#60a5fa' : '#e5e7eb',
        onPress: (_it: any, _idx: number, x: number, y: number) => setCalTip({ x, y, item: d })
    }));

    const hasAnyCalories = (data.dailyCalories || []).some(d => d.totalCalories > 0);

    useEffect(() => {
        if (!stepTip && !calTip) return;
        const t = setTimeout(() => { setStepTip(null); setCalTip(null); }, 3000);
        return () => clearTimeout(t);
    }, [stepTip, calTip]);

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

    const formatMinutesToHours = (totalMinutes: number) => {
        const totalSeconds = Math.floor(totalMinutes * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        if (totalMinutes > 0 && totalMinutes < 1) {
            return `${totalSeconds} giây`;
        }
        if (totalMinutes >= 1) {
            return `${hours} giờ ${minutes} phút`;
        }
    }

    return (
        <View className="bg-white p-4 rounded-2xl shadow-md w-full">
            <View className="flex-row justify-between items-center mb-3">
                <View>
                    <Text className="font-bold text-lg text-black">{t("Báo cáo hoạt động")}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-black font-semibold text-base">{data.summary.totalSessions}</Text>
                    <Text className="text-gray-500 text-xs">{t("Phiên tập")}</Text>
                </View>
            </View>

            <View className="flex-col gap-2 mb-4">
                <View className="bg-blue-50 px-3 py-2 rounded-lg">
                    <Text className="text-blue-700 font-semibold">{t("Thời gian")}: {formatMinutesToHours(data.summary.totalTime)}</Text>
                </View>
                <View className="bg-emerald-50 px-3 py-2 rounded-lg">
                    <Text className="text-emerald-700 font-semibold">{t("Quãng đường")}: {data.summary.totalDistance.toFixed(3)} km</Text>
                </View>
                <View className="bg-amber-50 px-3 py-2 rounded-lg">
                    <Text className="text-amber-700 font-semibold">{t("Calo")}: {data.summary.totalCalories} kcal</Text>
                </View>
            </View>

            <View className='flex-col gap-2'>
                <Text className='font-semibold text-black'>{t("So với tuần trước")}</Text>
                <View className="flex-row justify-between mb-3">
                    {renderDelta('Bước', data.comparison.steps.percentage)}
                    {renderDelta('Thời gian', data.comparison.time.percentage)}
                    {renderDelta('Quãng đường', data.comparison.distance.percentage)}
                </View>
            </View>

            <View className="bg-gray-50 rounded-xl p-3 mb-4">
                <Text className="font-semibold text-black mb-2">{t("Hoạt động tốt nhất")}</Text>
                <View className="flex-row justify-between">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-500">{t("Thời lượng")}</Text>
                        <Text className="text-black font-semibold">{formatMinutesToHours(data.bestSession.duration)}</Text>
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-gray-500">{t("Calo")}</Text>
                        <Text className="text-black font-semibold">{data.bestSession.calories} kcal</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mt-2">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-500">{t("Quãng đường")}</Text>
                        <Text className="text-black font-semibold">{data.bestSession.distance} km</Text>
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-gray-500">{t("Tốc độ TB")}    </Text>
                        <Text className="text-black font-semibold">{data.bestSession.avgSpeed} km/h</Text>
                    </View>
                </View>
            </View>

            <View className="mb-6">
                <Text className="font-semibold text-black mb-2">{t("Bước chân theo ngày")}</Text>
                <View className="items-center bg-gray-50 rounded-xl p-3">
                    <BarChart
                        data={stepsBar}
                        barWidth={24}
                        spacing={12}
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={0}
                        noOfSections={3}
                        maxValue={maxSteps}
                        barBorderRadius={6}
                        isAnimated
                    />
                    {stepTip && (
                        <View className="absolute bg-white rounded-lg shadow-lg p-2 border border-gray-200" style={{ left: stepTip.x + 16, top: stepTip.y - 58 }}>
                            <Text className="text-gray-700 text-xs">{stepTip.item.dayOfWeek} • {stepTip.item.date}</Text>
                            <Text className="text-black text-sm font-semibold">{stepTip.item.totalSteps} bước</Text>
                        </View>
                    )}
                </View>
            </View>

            <View>
                <Text className="font-semibold text-black mb-2">{t("Calo theo ngày")}</Text>
                {hasAnyCalories ? (
                    <View className="items-center bg-gray-50 rounded-xl p-3">
                        <BarChart
                            data={caloriesBar}
                            barWidth={24}
                            spacing={12}
                            hideRules
                            yAxisThickness={0}
                            xAxisThickness={0}
                            noOfSections={3}
                            maxValue={maxCalories}
                            barBorderRadius={6}
                            isAnimated
                        />
                        {calTip && (
                            <View className="absolute bg-white rounded-lg shadow-lg p-2 border border-gray-200" style={{ left: calTip.x + 16, top: calTip.y - 58 }}>
                                <Text className="text-gray-700 text-xs">{calTip.item.dayOfWeek} • {calTip.item.date}</Text>
                                <Text className="text-black text-sm font-semibold">{calTip.item.totalCalories} kcal</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="bg-gray-50 rounded-xl p-3 items-center">
                        <Text className="text-gray-500">{t("Không có dữ liệu")}</Text>
                    </View>
                )}
            </View>
        </View>
    )
}
export default WorkoutWeeklyCard