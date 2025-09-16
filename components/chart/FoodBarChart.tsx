import React from "react";
import { ScrollView, Text, View } from "react-native";

import { BarChart } from "react-native-gifted-charts";

const FoodBarChart = () => {
  const data = [
    { value: 800, label: "Mon" },
    { value: 1200, label: "Tue" },
    { value: 900, label: "Wed" },
    { value: 1500, label: "Thu" },
    { value: 2000, label: "Fri" },
    { value: 1700, label: "Sat" },
    { value: 1300, label: "Sun" },
  ];
  return (
    <View className="flex gap-2.5 bg-white p-4 rounded-md shadow-md mb-4 mt-4">
      <View>
        <Text className="font-bold text-xl">Tiến trình của bạn</Text>
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
          xAxisLabelTextStyle={{ color: "black" }}
          yAxisTextStyle={{ color: "black" }}
        />
      </ScrollView>
    </View>
  );
};

export default FoodBarChart;
