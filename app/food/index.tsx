import CalendarSwiper from "@/components/CalendarSwiper";
import FoodBarChart from "@/components/chart/FoodBarChart";
import FoodPieChart from "@/components/chart/FoodPieChart";
import FoodDaily from "@/components/FoodDaily";
import { foodWeekly, getFoodStatus } from "@/services/food";
import { FontAwesome6 } from "@expo/vector-icons";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const Page = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate ? Number(params.selectedDate) : 0
  );

  const {
    data: foodStatus,
    isLoading: loadingFoodStatus,
    refetch: refetchFoodStatus,
  } = useQuery({
    queryKey: ["foodStatus", {date:selectedDate}],
    queryFn: () =>
      getFoodStatus(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });

  const {
    data: foodWeeklyData,
    isLoading: loadingWeekly,
    refetch: refetchWeekly,
  } = useQuery({
    queryKey: ["foodWeekly", {date:selectedDate}],
    queryFn: () =>
      foodWeekly(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    select: (res) => res.data.dailyIntake,
  });

  useEffect(() => {
    const currentTimestamp = selectedDate || Math.floor(Date.now() / 1000);
    const prevTimestamp = currentTimestamp - 86400;
    const nextTimestamp = currentTimestamp + 86400;

    queryClient.prefetchQuery({
      queryKey: ["foodStatus", {date:prevTimestamp}],
      queryFn: () =>
        getFoodStatus({ date: (prevTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["foodStatus", {date:nextTimestamp}],
      queryFn: () => getFoodStatus({ date: (nextTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["foodWeekly", {date:prevTimestamp}],
      queryFn: () => foodWeekly({ date: (prevTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["foodWeekly", {date:nextTimestamp}],
      queryFn: () => foodWeekly({ date: (nextTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });

    if (selectedDate === 0) {
      const todayTimestamp = Math.floor(Date.now() / 1000);
      queryClient.prefetchQuery({
        queryKey: ["foodWeekly", {date:todayTimestamp}],
        queryFn: () => foodWeekly({ date: (todayTimestamp * 1000).toString() }),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [selectedDate, queryClient]);

  const groupedByTag = foodStatus?.history.reduce(
    (acc, item) => {
      if (!acc[item.tag]) acc[item.tag] = [];
      acc[item.tag].push(item);
      return acc;
    },
    {} as Record<string, typeof foodStatus.history>
  );

  // Exclude items titled "Invalid" for all usages except groupedByTag
  const filteredHistory = foodStatus?.history.filter((item) => item.name !== "Invalid") ?? [];

  const order = ["Sáng", "Trưa", "Tối", "Phụ", "Khác"];

  const loading = loadingFoodStatus || loadingWeekly || loadingFoodStatus || loadingWeekly;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const data = foodWeeklyData?.map((item) => ({
    value: item.totalCalories,
    label: item.dayOfWeek,
  }));  

  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex bg-[#f6f6f6] pt-16">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <FontAwesome6 name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center">{t("Thức ăn")}</Text>
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
          <Text className="font-bold text-xl">{t("Lượng thức ăn")}</Text>
          <Text className="text-black/60 text-xl text-center">
            <Text className="font-bold text-3xl text-black">
              {foodStatus?.currentCalories ?? 0}
            </Text>
            / 2000 kcal
          </Text>
        </View>
        <Text className="text-center text-lg text-black/60 py-2">
          {t("Bữa ăn quan trọng đối với sức khỏe hằng ngày, vì vậy hãy gửi ảnh về bữa ăn của bạn. Tôi sẽ cho bạn biết thành phần dinh dưỡng của bữa ăn.")}
        </Text>
        <View className="flex flex-row items-center justify-center py-5">
          <TouchableOpacity
            onPress={() => router.push("/food/upload" as Href)}
            className="self-center flex-row items-center justify-center w-[50%] bg-cyan-blue py-3 rounded-md shadow-md"
          >
            <Text className="text-xl text-white font-bold ">{t("Tải ảnh lên")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex gap-5">
        {order.map((tag) => {
          if (groupedByTag && groupedByTag[tag]) {
            return <FoodDaily key={tag} title={tag} data={groupedByTag[tag]} />;
          }
          return null;
        })}
      </View>
      <FoodPieChart data={filteredHistory} />
      <FoodBarChart data={data ?? []}/>
    </ScrollView>
  );
};

export default Page;
