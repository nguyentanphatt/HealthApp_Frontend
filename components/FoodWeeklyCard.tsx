
import { FoodWeekly } from '@/constants/type';
import { useAppTheme } from '@/context/appThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const FoodWeeklyCard = ({ data }: { data: FoodWeekly }) => {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
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

    const maxValue = Math.max(
        ...barData.map((item) => item.value),
        100 // Minimum value để đảm bảo biểu đồ có scale hợp lý
    );
    

    useEffect(() => {
        setTimeout(() => {
            setTooltip(null);
        }, 5000);
    }, [tooltip]);

    const renderNutrition = (label: string, value: number, color: string) => (
        <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base w-[60px]" style={{ color: theme.colors.textPrimary }}>{label}</Text>
            <View className="flex-1 h-3 bg-gray-200 rounded-full mx-3">
                <View
                    style={{ width: `${value}%`, backgroundColor: color }}
                    className="h-3 rounded-full"
                />
            </View>
            <Text className="text-sm w-[30px] text-right" style={{ color: theme.colors.textPrimary }}>{value}%</Text>
        </View>
    );

    return (
      <View
        className="p-4 rounded-2xl shadow-md w-full"
        style={{ backgroundColor: theme.colors.card }}
      >
        {data.currentWeekCalories === 0 ? (
          <View className="gap-5 py-1">
            <Text
              className="font-bold text-xl"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("Báo cáo dinh dưỡng")}
            </Text>

            <Text
              className="text-sm text-center"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("Không có dữ liệu hãy thêm dữ liệu thức ăn")}
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text
                  className="font-bold text-xl"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {t("Báo cáo dinh dưỡng")}
                </Text>
              </View>

              {isEqual ? (
                <Text
                  className="font-semibold text-lg"
                  style={{ color: theme.colors.textPrimary }}
                >
                  =
                </Text>
              ) : (
                <View className="flex-row items-center">
                  <FontAwesome6
                    name={isIncrease ? "arrow-up" : "arrow-down"}
                    size={16}
                    color={isIncrease ? "green" : "red"}
                  />
                  <Text
                    className={`ml-1 font-semibold text-lg ${
                      isIncrease ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isIncrease ? "+" : ""}
                    {diff}%
                  </Text>
                </View>
              )}
            </View>
            <View
              className="flex-col items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: theme.colors.secondaryCard }}
            >
              <Text
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {t("Tổng lượng calo")}
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: theme.colors.textPrimary }}
              >
                {data.currentWeekCalories} kcal
              </Text>
            </View>
            <View className="pt-2">
              <Text
                className="font-semibold mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                {t("Thành phần dinh dưỡng theo ngày")}
              </Text>
              <View
                className="items-center mb-5 rounded-xl p-3"
                style={{ backgroundColor: theme.colors.card }}
              >
                <BarChart
                  data={barData}
                  barWidth={25}
                  spacing={12}
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={theme.colors.border}
                  xAxisLabelTexts={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
                  noOfSections={3}
                  maxValue={maxValue}
                  barBorderRadius={6}
                  xAxisLabelTextStyle={{
                    color: theme.colors.textSecondary,
                    fontSize: 12,
                  }}
                  yAxisTextStyle={{
                    color: theme.colors.textSecondary,
                  }}
                />

                {tooltip && (
                  <View
                    className="absolute rounded-lg shadow-lg p-2"
                    style={{
                      backgroundColor: theme.colors.secondaryCard,
                      left: tooltip.x + 20,
                      top: tooltip.y - 60,
                    }}
                  >
                    <Text
                      className="text-xs"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {t("Chất đạm")}: {tooltip.item.protein}
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {t("Chất xơ")}: {tooltip.item.fiber}
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {t("Chất béo")}: {tooltip.item.fat}
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {t("Tinh bột")}: {tooltip.item.starch}
                    </Text>
                    <Text
                      className={`text-xs font-semibold mt-1`}
                      style={{
                        color: tooltip.item.isBalanced
                          ? theme.colors.tint
                          : theme.colors.textSecondary,
                      }}
                    >
                      {tooltip.item.isBalanced
                        ? t("Cân bằng ")
                        : t("Chưa cân bằng")}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text
              className="font-bold text-base mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("Thành phần dinh dưỡng trung bình (%)")}
            </Text>
            {renderNutrition(
              "Protein",
              data.averageNutrition.protein,
              "#60a5fa"
            )}
            {renderNutrition(
              t("Chất xơ"),
              data.averageNutrition.fiber,
              "#34d399"
            )}
            {renderNutrition(
              t("Chất béo"),
              data.averageNutrition.fat,
              "#fbbf24"
            )}
            {renderNutrition(
              t("Tinh bột"),
              data.averageNutrition.starch,
              "#f87171"
            )}
          </>
        )}
      </View>
    );
}

export default FoodWeeklyCard