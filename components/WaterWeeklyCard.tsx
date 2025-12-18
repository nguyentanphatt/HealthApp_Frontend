import { WaterWeekly } from '@/constants/type';
import { useAppTheme } from '@/context/appThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const WaterWeeklyCard = ({ data }: { data: WaterWeekly }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: WaterWeekly['dailyIntake'][number] } | null>(null);

  const maxWater = (() => {
    const arr = (data?.dailyIntake || []).map(d => d?.totalMl ?? 0);
    return arr.length ? Math.max(1000, ...arr) : 1000;
  })();

  const barData = (data?.dailyIntake || []).map(d => ({
    value: d?.totalMl ?? 0,
    label: d?.dayOfWeek ?? "",
    date: d?.date ?? "",
    ml: d?.totalMl ?? 0,
    frontColor: (d?.totalMl ?? 0) > 0 ? '#60a5fa' : '#e5e7eb',
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

  const hasAnyWater = (data?.totalWaterIntake ?? 0) > 0 || (data?.dailyIntake || []).some(d => (d?.totalMl ?? 0) > 0);

  return (
    <View
      className=" p-4 rounded-2xl shadow-md w-full"
      style={{ backgroundColor: theme.colors.card }}
    >
      {!hasAnyWater ? (
        <View className="gap-5 py-1">
          <Text
            className="font-bold text-xl"
            style={{ color: theme.colors.textPrimary }}
          >
            {t("Báo cáo nước uống")}
          </Text>

          <Text
            className="text-sm text-center"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("Không có dữ liệu hãy thêm dữ liệu nước uống")}
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text
                className="font-bold text-xl"
                style={{ color: theme.colors.textPrimary }}
              >
                {t("Báo cáo nước uống")}
              </Text>
            </View>
            <View className="items-end">
              <Text
                className="font-semibold text-base"
                style={{ color: theme.colors.textPrimary }}
              >
                {formatWaterAmount(data.totalWaterIntake)}
              </Text>
              <Text
                className="text-xs"
                style={{ color: theme.colors.textSecondary }}
              >
                {t("Tổng tuần")}
              </Text>
            </View>
          </View>

          <View className="flex-col gap-2 mb-4">
            <View
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: theme.colors.blueInfoCard }}
            >
              <Text className="text-blue-500 font-semibold">
                {t("Mục tiêu hiện tại")}:{" "}
                {formatWaterAmount(data.currentGoal)}
              </Text>
            </View>
            <View
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: theme.colors.emeraldInfoCard }}
            >
              <Text className="text-emerald-500 font-semibold">
                {t("Ngày uống nước")}: {data.daysWithWater}/7 {t("ngày")}
              </Text>
            </View>
            <View
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: theme.colors.amberInfoCard }}
            >
              <Text className="text-amber-500 font-semibold">
                {t("Ngày không uống nước")}: {data.daysWithoutWater}/7{" "}
                {t("ngày")}
              </Text>
            </View>
          </View>

          <View className="flex-col gap-2 mb-4">
            <Text
              className="font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("So với tuần trước")}
            </Text>
            <View className="flex-row justify-between">
              {renderDelta(t("Lượng nước"), data.waterDifference.percentage)}
              {renderDelta(t("Mục tiêu"), data.goalDifference.percentage)}
            </View>
          </View>

          <View
            className="rounded-xl p-3 mb-4"
            style={{ backgroundColor: theme.colors.secondaryCard }}
          >
            <Text
              className="font-semibold mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("Ngày uống nhiều nhất")}
            </Text>
            {data?.highestDay ? (
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text
                    className=""
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {t("Ngày")}
                  </Text>
                  <Text
                    className="font-semibold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {data.highestDay.dayOfWeek}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {data.highestDay.date}
                  </Text>
                </View>
                <View className="flex-1 ml-2">
                  <Text
                    className=""
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {t("Lượng nước")}
                  </Text>
                  <Text
                    className="font-semibold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {formatWaterAmount(data.highestDay.totalMl)}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row justify-between">
                <Text
                  className="text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t("Chưa có ngày uống trong tuần này")}
                </Text>
              </View>
            )}
          </View>

          <View className="mb-6">
            <Text
              className="font-semibold mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("Lượng nước theo ngày")}
            </Text>
            <View
              className="relative items-center rounded-xl p-3"
              style={{ backgroundColor: theme.colors.secondaryCard }}
            >
              <BarChart
                data={barData}
                barWidth={24}
                spacing={12}
                hideRules
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={theme.colors.border}
                xAxisLabelTexts={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
                noOfSections={3}
                maxValue={maxWater}
                barBorderRadius={6}
                renderTooltip={(item: any) => (
                  <View
                    className="rounded-lg shadow-lg p-2"
                    style={{ backgroundColor: theme.colors.secondaryCard }}
                  >
                    <Text
                      className="text-xs"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {item.label} • {item.date}
                    </Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {formatWaterAmount(item.ml)}
                    </Text>
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
        </>
      )}
    </View>
  );
}

export default WaterWeeklyCard
