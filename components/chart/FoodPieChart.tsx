import { FoodDetail } from "@/constants/type";
import { useAppTheme } from "@/context/appThemeContext";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const FoodPieChart = ({ data }: { data: FoodDetail[] }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [actualData, setActualData] = useState([
    { value: 0, color: "#009FFF", gradientCenterColor: "#006DFF", text: "0%" },
    { value: 0, color: "#93FCF8", gradientCenterColor: "#3BE9DE", text: "0%" },
    { value: 0, color: "#BDB2FA", gradientCenterColor: "#8F80F3", text: "0%" },
  ]);

  const pieData01 = [
    {
      value: 50,
      color: "#009FFF",
      gradientCenterColor: "#006DFF",
      text: "50%",
    },
    {
      value: 30,
      color: "#93FCF8",
      gradientCenterColor: "#3BE9DE",
      text: "30%",
    },
    {
      value: 20,
      color: "#BDB2FA",
      gradientCenterColor: "#8F80F3",
      text: "20%",
    },
  ];

  useEffect(() => {
    const totalProtein = data.reduce(
      (sum, item) => sum + (item.protein || 0),
      0
    );
    const totalStarch = data.reduce((sum, item) => sum + (item.starch || 0), 0);
    const totalFat = data.reduce((sum, item) => sum + (item.fat || 0), 0);
    const sum = totalProtein + totalStarch + totalFat || 1;

    setActualData([
      {
        ...actualData[0],
        value: totalProtein,
        text: `${Math.round((totalProtein / sum) * 100)}%`,
      },
      {
        ...actualData[1],
        value: totalStarch,
        text: `${Math.round((totalStarch / sum) * 100)}%`,
      },
      {
        ...actualData[2],
        value: totalFat,
        text: `${Math.round((totalFat / sum) * 100)}%`,
      },
    ]);
  }, [data]);

  const emptyActualData = [
    { value: 1, color: "#fff", gradientCenterColor: "#fff", text: "" },
    { value: 1, color: "#fff", gradientCenterColor: "#fff", text: "" },
    { value: 1, color: "#fff", gradientCenterColor: "#fff", text: "" },
  ];


  return (
    <View className="rounded-md shadow-md p-4 mt-10" style={{ backgroundColor: theme.colors.card }}>
      <Text className="font-bold text-xl mb-5" style={{ color: theme.colors.textPrimary }}>{t("Tỉ lệ dinh dưỡng")}</Text>
      <View className="flex flex-row items-center justify-between">
        <View>
          <PieChart
            data={pieData01}
            textColor={theme.colors.textPrimary}
            radius={80}
            textSize={24}
            strokeWidth={1}
            strokeColor="#333"
            showValuesAsLabels
            showGradient
          />
        </View>
        <View>
          <PieChart
            data={
              actualData.every((item) => item.value === 0)
                ? emptyActualData
                : actualData
            }
            textColor={theme.colors.textPrimary}
            radius={80}
            textSize={20}
            strokeWidth={1}
            strokeColor="#333"
            showValuesAsLabels
            showGradient
          />
        </View>
      </View>
      <View className="flex-row items-center justify-center gap-7 pt-10">
        <View className="flex-1 pr-4">
          <Text className="font-semibold text-center mb-2" style={{ color: theme.colors.textPrimary }}>{t("Đề xuất")}</Text>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="size-4 rounded-full bg-[#009FFF]" />
              <Text style={{ color: theme.colors.textPrimary }}>{t("Chất đạm")}</Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary }}>{pieData01[0].text}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="size-4 rounded-full bg-[#93FCF8]" />
              <Text style={{ color: theme.colors.textPrimary }}>{t("Tinh bột")}</Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary }}>{pieData01[1].text}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="size-4 rounded-full bg-[#BDB2FA]" />
              <Text style={{ color: theme.colors.textPrimary }}>{t("Chất béo")}</Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary }}>{pieData01[2].text}</Text>
          </View>
        </View>
        <View className="flex-1 pl-4">
          <Text className="font-semibold text-center mb-2" style={{ color: theme.colors.textPrimary }}>{t("Thực tế")}</Text>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="size-4 rounded-full bg-[#009FFF]" />
              <Text style={{ color: theme.colors.textPrimary }}>{t("Chất đạm")}</Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary }}>{actualData[0].text}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="size-4 rounded-full bg-[#93FCF8]" />
              <Text style={{ color: theme.colors.textPrimary }}>{t("Tinh bột")}</Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary }}>{actualData[1].text}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="size-4 rounded-full bg-[#BDB2FA]" />
              <Text style={{ color: theme.colors.textPrimary }}>{t("Chất béo")}</Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary }}>{actualData[2].text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FoodPieChart;
