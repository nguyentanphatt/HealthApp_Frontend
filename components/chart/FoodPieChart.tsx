import { FoodDetail } from "@/constants/type";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const FoodPieChart = ({data}: {data:FoodDetail[]}) => {
  const { t } = useTranslation();
  const [actualData, setActualData] = useState([
    { value: 0, color: "#009FFF", gradientCenterColor: "#006DFF", text: "0%" }, // Protein
    { value: 0, color: "#93FCF8", gradientCenterColor: "#3BE9DE", text: "0%" }, // Tinh bột
    { value: 0, color: "#BDB2FA", gradientCenterColor: "#8F80F3", text: "0%" }, // Chất béo
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
    // Tính tổng protein, starch, fat từ data
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
    <View className="bg-white rounded-md shadow-md p-4 mt-10">
      <Text className="font-bold text-xl mb-5">{t("Tỉ lệ dinh dưỡng")}</Text>
      <View className="flex flex-row items-center justify-between">
        <View>
          <PieChart
            data={pieData01}
            showText
            textColor="black"
            radius={80}
            textSize={20}
            strokeWidth={2}
            strokeColor="#333"
            showValuesAsLabels
            showGradient
          />
          <Text className="text-lg text-center">{t("Đề xuất")}</Text>
        </View>
        <View>
          <PieChart
            data={
              actualData.every((item) => item.value === 0)
                ? emptyActualData
                : actualData
            }
            showText={
              actualData.every((item) => item.value === 0)
                ? false
                : true
            }
            textColor="black"
            radius={80}
            textSize={20}
            strokeWidth={2}
            strokeColor="#333"
            showValuesAsLabels
            showGradient
          />
          <Text className="text-lg text-center">{t("Thực tế")}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-center gap-7 pt-10">
        <View className="flex-row items-center gap-2">
          <View className="size-4 rounded-full bg-[#009FFF]" />
          <Text>{t("Chất đạm")}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="size-4 rounded-full bg-[#93FCF8]" />
          <Text>{t("Tinh bột")}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="size-4 rounded-full bg-[#BDB2FA]" />
          <Text>{t("Chất béo")}</Text>
        </View>
      </View>
    </View>
  );
};

export default FoodPieChart;
