import { useAppTheme } from "@/context/appThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { BarChart } from "react-native-gifted-charts";

const FoodBarChart = ({data}: {
  data: { value: number; label: string }[];
}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  return (
    <View className="flex gap-2.5 p-4 rounded-md shadow-md mb-4 mt-4" style={{ backgroundColor: theme.colors.card }}>
      <View>
        <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Tiến trình của bạn")}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        <BarChart
          data={data}
          barWidth={24}
          frontColor="#00BFFF"
          noOfSections={3}
          yAxisLabelTexts={["0", "500", "1000", "1500", "2000"]}
          maxValue={2000}
          xAxisLabelTextStyle={{ color: theme.colors.textPrimary }}
          yAxisTextStyle={{ color: theme.colors.textPrimary }}
          xAxisColor={theme.colors.border}
          yAxisColor={theme.colors.border}
        />
      </ScrollView>
    </View>
  );
};

export default FoodBarChart;
