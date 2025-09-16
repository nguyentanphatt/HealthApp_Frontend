import React from "react";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const FoodPieChart = () => {
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

    const pieData02 = [
      { value: 1, color: "#ffffff20", gradientCenterColor: "#ffffff20" },
      { value: 1, color: "#ffffff20", gradientCenterColor: "#ffffff20" },
      { value: 1, color: "#ffffff20", gradientCenterColor: "#ffffff20" },
    ];
  return (
    <View className="bg-white rounded-md shadow-md p-4 mt-10">
      <Text className="font-bold text-xl mb-5">Tỉ lệ dinh dưỡng</Text>
      <View className="flex flex-row items-center justify-between">
        <View>
          <PieChart
            data={pieData01}
            showText
            textColor="black"
            radius={80}
            textSize={20}
            showValuesAsLabels
            showGradient
          />
          <Text className="text-lg text-center">Đề xuất</Text>
        </View>
        <View>
          <PieChart
            data={pieData02}
            //showText
            textColor="black"
            radius={80}
            textSize={20}
            strokeWidth={2}
            strokeColor="#333"
            showValuesAsLabels
            showGradient
          />
          <Text className="text-lg text-center">Thực tế</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-center gap-7 pt-10">
        <View className="flex-row items-center gap-2">
          <View className="size-4 rounded-full bg-[#009FFF]" />
          <Text>Protein</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="size-4 rounded-full bg-[#93FCF8]" />
          <Text>Tinh bột</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="size-4 rounded-full bg-[#BDB2FA]" />
          <Text>Chất béo</Text>
        </View>
      </View>
    </View>
  );
};

export default FoodPieChart;
