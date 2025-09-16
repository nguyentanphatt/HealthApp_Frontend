import CalendarSwiper from "@/components/CalendarSwiper";
import FoodBarChart from "@/components/chart/FoodBarChart";
import FoodPieChart from "@/components/chart/FoodPieChart";
import FoodDaily from "@/components/FoodDaily";
import { images } from "@/constants/image";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
const Page = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate ? Number(params.selectedDate) : 0
  );

  /* if (
    loading ||
    !waterStatus ||
    !weatherReport ||
    !waterWeeklyData ||
    !waterReminderData
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  } */

  const meals = [
    {
      image: images.food01,
      name: "Steak",
      nutrition: [
        { label: "Protein", value: "500g" },
        { label: "Chất xơ", value: "500g" },
        { label: "Chất đạm", value: "500g" },
      ],
      total: "2000 kcal",
    },
    {
      image: images.food01,
      name: "Steak",
      nutrition: [
        { label: "Protein", value: "500g" },
        { label: "Chất xơ", value: "500g" },
        { label: "Chất đạm", value: "500g" },
      ],
      total: "2500 Kcal",
    },
  ];

  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex bg-[#f6f6f6] pt-10">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <FontAwesome6 name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center">Thức ăn</Text>
          <View style={{ width: 24 }} />
        </View>
        <CalendarSwiper
          selectedDate={
            selectedDate
              ? dayjs.unix(selectedDate).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD")
          }
          onDateChange={(date, timestamp) => {
            setSelectedDate(Number((timestamp / 1000).toFixed(0)));
          }}
        />
      </View>
      <View className="flex gap-2.5">
        <View className="bg-white rounded-md shadow-md flex justify-between gap-5 w-full px-4 py-4">
          <Text className="font-bold text-xl">Lượng thức ăn</Text>
          <Text className="text-black/60 text-xl text-center">
            <Text className="font-bold text-3xl text-black">0</Text>/ 2000 kcal
          </Text>
        </View>
        <Text className="text-center text-lg text-black/60 py-2">
          Bữa ăn quan trọng đối với sức khỏe hằng ngày, vì vậy hãy gửi ảnh về
          bữa ăn của bạn. Tôi sẽ cho bạn biết thành phần dinh dưỡng của bữa ăn.
        </Text>
        <View className="flex flex-row items-center justify-center py-5">
          <TouchableOpacity
            onPress={() => router.push("/food/upload" as Href)}
            className="self-center flex-row items-center justify-center w-[50%] bg-cyan-blue py-3 rounded-md shadow-md"
          >
            <Text className="text-xl text-white font-bold ">Tải ảnh lên</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex gap-5">
        <FoodDaily title="Bữa sáng" data={meals} />
        <FoodDaily title="Bữa trưa" data={meals} />
        <FoodDaily title="Bữa tối" data={meals} />
      </View>
      <FoodPieChart />
      <FoodBarChart />

    </ScrollView>
  );
};

export default Page;
