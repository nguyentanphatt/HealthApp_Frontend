import { WorkoutWeekly } from '@/constants/type';
import { useAppTheme } from '@/context/appThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const WorkoutWeeklyCard = ({ data }: { data: WorkoutWeekly }) => {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const [stepTip, setStepTip] = useState<{ x: number; y: number; item: WorkoutWeekly['dailySteps'][number] } | null>(null);
    const [calTip, setCalTip] = useState<{ x: number; y: number; item: WorkoutWeekly['dailyCalories'][number] } | null>(null);

    const maxSteps = (() => {
        const arr = (data?.dailySteps || []).map(d => d?.totalSteps ?? 0);
        return arr.length ? Math.max(300, ...arr) : 300;
    })();
    const maxCalories = (() => {
        const arr = (data?.dailyCalories || []).map(d => d?.totalCalories ?? 0);
        return arr.length ? Math.max(100, ...arr) : 100;
    })();

    const stepsBar = (data?.dailySteps || []).map(d => ({
        value: d?.totalSteps ?? 0,
        label: d?.dayOfWeek ?? "",
        date: d?.date ?? "",
        steps: d?.totalSteps ?? 0,
        frontColor: (d?.totalSteps ?? 0) > 0 ? '#34d399' : '#e5e7eb',
    }));
    const caloriesBar = (data?.dailyCalories || []).map(d => ({
        value: d?.totalCalories ?? 0,
        label: d?.dayOfWeek ?? "",
        date: d?.date ?? "",
        calories: d?.totalCalories ?? 0,
        frontColor: (d?.totalCalories ?? 0) > 0 ? '#60a5fa' : '#e5e7eb',
    }));

    const hasAnyCalories = (data?.dailyCalories || []).some(d => (d?.totalCalories ?? 0) > 0);
    const hasAnySteps = (data?.dailySteps || []).some(d => (d?.totalSteps ?? 0) > 0);
    const hasAnyWorkout = (data?.summary?.totalSessions ?? 0) > 0 || hasAnySteps || hasAnyCalories;

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
            return `${totalSeconds} ${t("giây")}`;
        }
        if (totalMinutes >= 1) {
            return `${hours} ${t("giờ")} ${minutes} ${t("phút")}`;
        }
    }

    return (
        <View className=" p-4 rounded-2xl shadow-md w-full" style={{ backgroundColor: theme.colors.card }}>
            <View className="flex-row justify-between items-center mb-3">
                <View>
                    <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Báo cáo hoạt động")}</Text>
                </View>
                <View className="items-end">
                    <Text className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{data.summary.totalSessions}</Text>
                    <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>{t("Phiên tập")}</Text>
                </View>
            </View>

            <View className="flex-col gap-2 mb-4">
                <View className="px-3 py-2 rounded-lg" style={{ backgroundColor: theme.colors.blueInfoCard }}>
                    <Text className="text-blue-500 font-semibold">{t("Thời gian")}: {formatMinutesToHours(data?.summary?.totalTime ?? 0)}</Text>
                </View>
                <View className="px-3 py-2 rounded-lg" style={{ backgroundColor: theme.colors.emeraldInfoCard }}>
                    <Text className="text-emerald-500 font-semibold">{t("Quãng đường")}: {(data?.summary?.totalDistance ?? 0).toFixed(3)} km</Text>
                </View>
                <View className="px-3 py-2 rounded-lg" style={{ backgroundColor: theme.colors.amberInfoCard }}>
                    <Text className="text-amber-500 font-semibold">{t("Calo")}: {(data?.summary?.totalCalories ?? 0).toFixed(2)} kcal</Text>
                </View>
                <View className="px-3 py-2 rounded-lg" style={{ backgroundColor: theme.colors.redInfoCard }}>
                    <Text className="text-red-500 font-semibold">{t("Bước chân")}: {data?.summary?.totalSteps ?? 0} {t("bước")}</Text>
                </View>
            </View>

            <View className='flex-col gap-2'>
                <Text className='font-semibold' style={{ color: theme.colors.textPrimary }}>{t("So với tuần trước")}</Text>
                <View className="flex-row justify-between mb-3">
                    {renderDelta(t("Bước chân"), data.comparison.steps.percentage)}
                    {renderDelta(t("Thời gian"), data.comparison.time.percentage)}
                    {renderDelta(t("Quãng đường"), data.comparison.distance.percentage)}
                </View>
            </View>

            <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: theme.colors.secondaryCard }}>
                <Text className="font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>{t("Hoạt động tốt nhất")}</Text>
                {data?.bestSession ? (
                    <>
                        <View className="flex-row justify-between">
                            <View className="flex-1 mr-2">
                                <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Thời lượng")}</Text>
                                <Text className="font-semibold" style={{ color: theme.colors.textPrimary }}>{formatMinutesToHours(data.bestSession.duration)}</Text>
                            </View>
                            <View className="flex-1 ml-2">
                                <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Calo")}</Text>
                                <Text className="font-semibold" style={{ color: theme.colors.textPrimary }}>{data.bestSession.calories} kcal</Text>
                            </View>
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <View className="flex-1 mr-2">
                                <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Quãng đường")}</Text>
                                <Text className="font-semibold" style={{ color: theme.colors.textPrimary }}>{data.bestSession.distance} km</Text>
                            </View>
                            <View className="flex-1 ml-2">
                                <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Tốc độ TB")}    </Text>
                                <Text className="font-semibold" style={{ color: theme.colors.textPrimary }}>{data.bestSession.avgSpeed} km/h</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <View className="items-center">
                        <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>{hasAnyWorkout ? t("Không có phiên nổi bật") : t("Chưa có dữ liệu tuần này")}</Text>
                    </View>
                )}
            </View>

            <View className="mb-6">
                <Text className="font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>{t("Bước chân theo ngày")}</Text>
                <View className="relative items-center rounded-xl p-3" style={{ backgroundColor: theme.colors.secondaryCard }}>
                    <BarChart
                        data={stepsBar}
                        barWidth={24}
                        spacing={12}
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={1}
                        xAxisColor={theme.colors.border}
                        xAxisLabelTexts={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
                        noOfSections={3}
                        maxValue={maxSteps}
                        barBorderRadius={6}
                        renderTooltip={(item: any) => (
                            <View className="rounded-lg shadow-lg p-2" style={{ backgroundColor: theme.colors.secondaryCard }}>
                                <Text className="text-xs" style={{ color: theme.colors.textPrimary }}>{item.label} • {item.date}</Text>
                                <Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{item.steps} {t("bước")}</Text>
                            </View>
                        )}
                        xAxisLabelTextStyle={{
                            color: theme.colors.textSecondary,
                            fontSize: 12,
                        }}
                        yAxisTextStyle={{
                            color: theme.colors.textSecondary,
                        }}
                    />
                </View>
            </View>

            <View>
                <Text className="font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>{t("Calo theo ngày")}</Text>
                {hasAnyCalories ? (
                    <View className="relative items-center rounded-xl p-3" style={{ backgroundColor: theme.colors.secondaryCard }}>
                        <BarChart
                            data={caloriesBar}
                            barWidth={24}
                            spacing={12}
                            hideRules
                            yAxisThickness={0}
                            xAxisThickness={1}
                            xAxisColor={theme.colors.border}
                            xAxisLabelTexts={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
                            noOfSections={3}
                            maxValue={maxCalories}
                            barBorderRadius={6}
                            renderTooltip={(item: any) => (
                                <View className="rounded-lg shadow-lg p-2" style={{ backgroundColor: theme.colors.secondaryCard }}>
                                    <Text className="text-xs" style={{ color: theme.colors.textPrimary }}>{item.label} • {item.date}</Text>
                                    <Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{item.calories} kcal</Text>
                                </View>
                            )}
                            xAxisLabelTextStyle={{
                                color: theme.colors.textSecondary,
                                fontSize: 12,
                            }}
                            yAxisTextStyle={{
                                color: theme.colors.textSecondary,
                            }}
                        />
                    </View>
                ) : (
                    <View className="rounded-xl p-3 items-center" style={{ backgroundColor: theme.colors.secondaryCard }}>
                        <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>{t("Không có dữ liệu")}</Text>
                    </View>
                )}
            </View>
        </View>
    )
}
export default WorkoutWeeklyCard