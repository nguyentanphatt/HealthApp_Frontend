
import { FoodWeekly } from '@/constants/type';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const FoodWeeklyCard = ({ data }: { data: FoodWeekly }) => {
    const { t } = useTranslation();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; item: any } | null>(null);
    const diff = data.caloriesDifference?.percentage ?? 0;
    const isIncrease = diff > 0;
    const isEqual = data.currentWeekCalories === data.previousWeekCalories;

    const barData = data.balancedDays.map((day: any) => ({
        value: day.protein + day.fiber + day.fat + day.starch,
        label: day.dayOfWeek,
        frontColor: day.isBalanced ? "#22c55e" : "#d1d5db",
        onPress: (x: number, y: number) => setTooltip({ x, y, item: day }),
    }));

    useEffect(() => {
        setTimeout(() => {
            setTooltip(null);
        }, 5000);
    }, [tooltip]);

    const renderNutrition = (label: string, value: number, color: string) => (
        <View className="flex-row items-center justify-between mb-2">
            <Text className="text-black text-base w-[60px]">{label}</Text>
            <View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
                <View
                    style={{ width: `${value}%`, backgroundColor: color }}
                    className="h-3 rounded-full"
                />
            </View>
            <Text className="text-black text-sm w-[30px] text-right">{value}%</Text>
        </View>
    );

    return (
        <View className="bg-white p-4 rounded-2xl shadow-md w-full">
            {data.currentWeekCalories === 0 ? (
                <View className='flex-1 gap-5'>
                    <Text className="font-bold text-lg text-black">
                        {t("Báo cáo dinh dưỡng")}
                    </Text>
                    <Text className='text-gray-500 text-sm text-center'>
                        {t("Không có dữ liệu hãy thêm dữ liệu thức ăn")}
                    </Text>
                </View>
            ) : (
                <>
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="font-bold text-xl text-black">
                                {t("Báo cáo dinh dưỡng")}
                            </Text>
                        </View>

                        {isEqual ? (
                            <Text className="text-yellow-500 font-semibold text-lg">=</Text>
                        ) : (
                            <View className="flex-row items-center">
                                <FontAwesome6
                                    name={isIncrease ? "arrow-up" : "arrow-down"}
                                    size={16}
                                    color={isIncrease ? "green" : "red"}
                                />
                                <Text
                                    className={`ml-1 font-semibold text-lg ${isIncrease ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {isIncrease ? "+" : ""}
                                    {diff}%
                                </Text>
                            </View>
                        )}
                    </View>
                    <View className='flex-col items-center justify-between bg-gray-50 rounded-xl p-3'>
                        <Text className='text-gray-500 text-sm'>
                            {t("Tổng lượng calo")}
                        </Text>
                        <Text className="text-black text-2xl font-bold">
                            {data.currentWeekCalories} kcal
                        </Text>
                    </View>
                    <View className='pt-2'>
                        <Text className="font-semibold text-black mb-2">{t("Thành phần dinh dưỡng theo ngày")}</Text>
                        <View className="items-center mb-5 bg-gray-50 rounded-xl p-3">
                            <BarChart
                                data={barData}
                                barWidth={25}
                                spacing={12}
                                hideRules
                                yAxisThickness={0}
                                xAxisThickness={0}
                                noOfSections={3}
                                barBorderRadius={6}
                                isAnimated
                            />

                            {tooltip && (
                                <View
                                    className="absolute bg-white rounded-lg shadow-lg p-2 border border-gray-200"
                                    style={{
                                        left: tooltip.x + 20,
                                        top: tooltip.y - 60,
                                    }}
                                >
                                    <Text className="text-gray-700 text-xs">Protein: {tooltip.item.protein}</Text>
                                    <Text className="text-gray-700 text-xs">Chất xơ: {tooltip.item.fiber}</Text>
                                    <Text className="text-gray-700 text-xs">Chất béo: {tooltip.item.fat}</Text>
                                    <Text className="text-gray-700 text-xs">Tinh bột: {tooltip.item.starch}</Text>
                                    <Text
                                        className={`text-xs font-semibold mt-1 ${tooltip.item.isBalanced ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {tooltip.item.isBalanced ? "Cân bằng ✅" : "Chưa cân bằng ❌"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <Text className="font-bold text-base mb-2 text-black">
                        {t("Thành phần dinh dưỡng trung bình (%)")}
                    </Text>
                    {renderNutrition("Protein", data.averageNutrition.protein, "#60a5fa")}
                    {renderNutrition("Chất xơ", data.averageNutrition.fiber, "#34d399")}
                    {renderNutrition("Chất béo", data.averageNutrition.fat, "#fbbf24")}
                    {renderNutrition("Tinh bột", data.averageNutrition.starch, "#f87171")}
                </>
            )}
        </View>
    );
}

export default FoodWeeklyCard