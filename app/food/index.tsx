import CalendarSwiper from "@/components/CalendarSwiper";
import FoodBarChart from "@/components/chart/FoodBarChart";
import FoodPieChart from "@/components/chart/FoodPieChart";
import FoodDaily from "@/components/FoodDaily";
import { meals } from "@/constants/data";
import { useAppTheme } from "@/context/appThemeContext";
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
  const { theme } = useAppTheme();
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
    queryKey: ["foodStatus", { date: selectedDate }],
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
    queryKey: ["foodWeekly", { date: selectedDate }],
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
      queryKey: ["foodStatus", { date: prevTimestamp }],
      queryFn: () =>
        getFoodStatus({ date: (prevTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["foodStatus", { date: nextTimestamp }],
      queryFn: () => getFoodStatus({ date: (nextTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["foodWeekly", { date: prevTimestamp }],
      queryFn: () => foodWeekly({ date: (prevTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["foodWeekly", { date: nextTimestamp }],
      queryFn: () => foodWeekly({ date: (nextTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });

    if (selectedDate === 0) {
      const todayTimestamp = Math.floor(Date.now() / 1000);
      queryClient.prefetchQuery({
        queryKey: ["foodWeekly", { date: todayTimestamp }],
        queryFn: () => foodWeekly({ date: (todayTimestamp * 1000).toString() }),
        staleTime: 1000 * 60 * 5,
      });
      queryClient.prefetchQuery({
        queryKey: ["foodStatus", { date: todayTimestamp }],
        queryFn: () => getFoodStatus({ date: (todayTimestamp * 1000).toString() }),
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

  const filteredHistory = foodStatus?.history.filter((item) => item.name !== "Invalid") ?? [];

  const loading = loadingFoodStatus || loadingWeekly || loadingFoodStatus || loadingWeekly;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.textPrimary} />
      </View>
    );
  }

  const data = foodWeeklyData?.map((item) => ({
    value: item.totalCalories,
    label: item.dayOfWeek,
  }));

  const isEmpty = data?.every((item) => item.value === 0);
  return (
    <View className='flex-1 pt-12' style={{ backgroundColor: theme.colors.background }}>
      <View className="flex py-5" style={{ backgroundColor: theme.colors.background }}>
        <View className='flex flex-row items-center justify-between w-full'>
          <TouchableOpacity onPress={() => router.push("/(tabs)" as Href)} className='size-14 rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.background }}>
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Thức ăn")}</Text>
          <View className='size-14 rounded-full' style={{ backgroundColor: theme.mode === "dark" ? theme.colors.card : theme.colors.background }} />
        </View>
        <View className="px-4">
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
      </View>
      <ScrollView
        className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular" style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >

        <View className="flex gap-2.5">
          <View className="rounded-md shadow-md flex justify-between gap-5 w-full px-4 py-4" style={{ backgroundColor: theme.colors.card }}>
            <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Lượng thức ăn")}</Text>
            <Text className="text-xl text-center" style={{ color: theme.colors.textSecondary }}>
              <Text className="font-bold text-3xl" style={{ color: theme.colors.textPrimary }}>
                {foodStatus?.currentCalories ?? 0}
              </Text>
              / 2000 kcal
            </Text>
          </View>
          <Text className="text-center text-lg py-2" style={{ color: theme.colors.textSecondary }}>
            {t("Bữa ăn quan trọng đối với sức khỏe hằng ngày, vì vậy hãy gửi ảnh về bữa ăn của bạn. Tôi sẽ cho bạn biết thành phần dinh dưỡng của bữa ăn.")}
          </Text>
          <View className="flex flex-row items-center justify-center py-5">
            <TouchableOpacity
              onPress={() => router.push("/food/upload" as Href)}
              className="self-center flex-row items-center justify-center w-[50%] bg-cyan-blue py-3 rounded-md shadow-md"
            >
              <Text className="text-xl font-bold text-white">{t("Tải ảnh lên")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex gap-5">
          {meals.map((tag) => {
            if (groupedByTag && groupedByTag[tag]) {
              return <FoodDaily key={tag} title={tag} data={groupedByTag[tag]} selectedDate={selectedDate} />;
            }
            return null;
          })}
        </View>
        <FoodPieChart data={filteredHistory} />
        {isEmpty ? null : <FoodBarChart data={data ?? []} />}
      </ScrollView>
    </View>
  );
};

export default Page;
