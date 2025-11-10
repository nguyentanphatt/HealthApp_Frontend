import CalendarSwiper from "@/components/CalendarSwiper";
import InfoCard from "@/components/InfoCard";
import ReminderList from "@/components/ReminderList";
import WaterVector from "@/components/vector/WaterVector";
import WaterHistory from "@/components/WaterHistory";
import Weather from "@/components/Weather";
import { WaterStatus, WeatherResponse } from "@/constants/type";
import { useAppTheme } from "@/context/appThemeContext";
import { useUnits } from "@/hooks/useUnits";
import {
  getIp,
  getWaterReminder,
  getWaterStatus,
  saveWaterRecord,
  updateWaterDailyGoal,
  WaterWeekly,
  WeatherSuggest,
} from "@/services/water";
import { useModalStore } from "@/stores/useModalStore";
import { FontAwesome6 } from "@expo/vector-icons";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Toast from "react-native-toast-message";
dayjs.extend(utc);
dayjs.extend(timezone);
const Page = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { openModal } = useModalStore();
  const { units, displayWater, inputToBaseWater } = useUnits();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate ? Number(params.selectedDate) : 0
  );
  const currentDate = Date.now();
  const initialValue =
    units.water === "ml"
      ? 360
      : Number(displayWater(360).value.toFixed(2));

  const items =
    units.water === "ml"
      ? Array.from({ length: 100 }, (_, i) => {
        const amount = (i + 1) * 10;
        return { label: `${amount}`, amount };
      })
      : Array.from({ length: (170 - 1) / 1 + 1 }, (_, i) => {
        const amount = 1 + i * 1;
        return { label: `${amount}`, amount };
      });

  const {
    data: waterStatus,
    isLoading: loadingWaterStatus,
    refetch: refetchWaterStatus,
  } = useQuery({
    queryKey: ["waterStatus", { date: selectedDate }],
    queryFn: () =>
      getWaterStatus(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });

  const {
    data: weatherReport,
    isLoading: loadingWeather,
  } = useQuery({
    queryKey: ["weatherReport"],
    queryFn: async () => {
      const ip = await getIp();
      return WeatherSuggest(ip);
    },
  });

  const {
    data: waterWeeklyData,
    isLoading: loadingWeekly,
    refetch: refetchWeekly,
  } = useQuery({
    queryKey: ["waterWeekly", { date: selectedDate }],
    queryFn: () =>
      WaterWeekly(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    select: (res) => res.data.dailyIntake,
  });

  const {
    data: waterReminderData,
    isLoading: loadingReminder,
    refetch: refetchReminder,
  } = useQuery({
    queryKey: ["waterReminder"],
    queryFn: () => getWaterReminder(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });

  useEffect(() => {
    const currentTimestamp = selectedDate || Math.floor(Date.now() / 1000);
    const prevTimestamp = currentTimestamp - 86400;
    const nextTimestamp = currentTimestamp + 86400;

    queryClient.invalidateQueries({
      queryKey: ["waterStatus", { date: currentTimestamp }],
    });
    queryClient.invalidateQueries({
      queryKey: ["waterWeekly", { date: currentTimestamp }],
    });

    queryClient.prefetchQuery({
      queryKey: ["waterStatus", { date: prevTimestamp }],
      queryFn: () =>
        getWaterStatus({ date: (prevTimestamp * 1000).toString() }),
    });
    queryClient.prefetchQuery({
      queryKey: ["waterStatus", { date: nextTimestamp }],
      queryFn: () =>
        getWaterStatus({ date: (nextTimestamp * 1000).toString() }),
    });

    queryClient.prefetchQuery({
      queryKey: ["waterWeekly", { date: prevTimestamp }],
      queryFn: () =>
        WaterWeekly({ date: (prevTimestamp * 1000).toString() }),
    });
    queryClient.prefetchQuery({
      queryKey: ["waterWeekly", { date: nextTimestamp }],
      queryFn: () =>
        WaterWeekly({ date: (nextTimestamp * 1000).toString() }),
    });

    if (selectedDate === 0) {
      const todayTimestamp = Math.floor(Date.now() / 1000);
      queryClient.prefetchQuery({
        queryKey: ["waterWeekly", { date: todayTimestamp }],
        queryFn: () =>
          WaterWeekly({ date: (todayTimestamp * 1000).toString() }),
      });
    }

    queryClient.prefetchQuery({
      queryKey: ["waterReminder"],
      queryFn: () => getWaterReminder(),
    });
  }, [selectedDate, queryClient]);

  const handleConfirm = async (amount: number, time: string) => {
    const valueInMl = inputToBaseWater(amount);
    try {
      await saveWaterRecord(valueInMl, time);
      refetchWaterStatus();
      refetchWeekly();
      refetchReminder();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleUpdateGoal = async (amount: number, time: string) => {
    try {
      const response = await updateWaterDailyGoal(amount, time);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: response.message,
        });
        refetchWaterStatus();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isInitialLoading =
    (loadingWaterStatus && !waterStatus) ||
    (loadingWeather && !weatherReport) ||
    (loadingWeekly && !waterWeeklyData) ||
    (loadingReminder && !waterReminderData);

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const filtered = waterStatus?.history.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const percent =
    ((waterStatus?.currentIntake ?? 0) / (waterStatus?.dailyGoal ?? 1)) * 100;

  const data = waterWeeklyData?.map((item) => ({
    value: displayWater(item.totalMl).value,
    label: item.dayOfWeek,
  }));

  const baseLabels = [0, 500, 1000, 1500, 2000];
  const yAxisLabelTexts = baseLabels.map((val) =>
    displayWater(val).value.toString()
  );
  return (
    <View className="flex-1 pt-12" style={{ backgroundColor: theme.colors.background }}>
      <View className="flex px-4 py-5" style={{ backgroundColor: theme.colors.background }}>
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Nước")}</Text>
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
      <ScrollView
        className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular" style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row">
          <View className="relative flex-1 items-center justify-center rounded-md shadow-md mr-1" style={{ backgroundColor: theme.colors.card }}>
            <WaterVector
              progress={
                waterStatus
                  ? (waterStatus.currentIntake / waterStatus.dailyGoal) * 100
                  : 0
              }
              animated={true}
            />
            <Text className="absolute top-2 right-2 text-lg" style={{ color: theme.colors.textPrimary }}>
              - {displayWater(waterStatus?.dailyGoal ?? 0).formatted}
            </Text>
          </View>
          <View className="flex-1 justify-between ml-1">
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/water/goal?amount=${waterStatus?.dailyGoal}&time=${waterStatus?.date}` as Href
                )
              }
            >
              <InfoCard
                title={t("Mục tiêu")}
                content={
                  displayWater(waterStatus?.dailyGoal ?? 0).formatted ||
                  displayWater(2000).formatted
                }
              />
            </TouchableOpacity>
            <InfoCard
              title={t("Tiến độ")}
              content={
                displayWater(waterStatus?.currentIntake || 0).formatted ||
                displayWater(0).formatted
              }
              subcontent={
                ` / ${displayWater(waterStatus?.dailyGoal || 0).formatted}` ||
                displayWater(2000).formatted
              }
            />
            <TouchableOpacity
              onPress={() => router.push("/water/notification" as Href)}
              className="flex flex-row items-center justify-center gap-2.5 p-2 rounded-md shadow-md h-[70px]" style={{ backgroundColor: theme.colors.card }}
            >
              <FontAwesome6 name="calendar" size={24} color={theme.colors.textPrimary} />
              <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{t("Nhắc nhở tôi")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex items-center justify-center py-4">
          {(() => {
            const isToday = selectedDate === 0 || dayjs.unix(selectedDate).isSame(dayjs(), 'day');
            return (
              <TouchableOpacity
                disabled={!isToday}
                accessibilityState={{ disabled: !isToday }}
                className={`self-center flex-row items-center justify-center w-[70%] py-3 rounded-full ${isToday ? 'bg-cyan-blue' : 'bg-gray-300'}`}
                onPress={isToday ? () => openModal("waterwheel", {
                  title: `${t("Lượng nước uống")} (${units.water})`,
                  items: items,
                  initialValue: initialValue,
                  currentDate: currentDate,
                  handleConfirm: handleConfirm,
                }) : undefined}
              >
                <Text className="text-xl text-white">{t("Thêm")}</Text>
              </TouchableOpacity>
            )
          })()}
        </View>

        {waterReminderData &&
          (() => {
            const currentDate = selectedDate || Math.floor(Date.now() / 1000);
            const currentDateStr = dayjs.unix(currentDate).format("YYYY-MM-DD");

            const filteredReminders = waterReminderData.filter((reminder) => {
              const reminderDateStr = dayjs(reminder.expiresIn).format(
                "YYYY-MM-DD"
              );
              return reminderDateStr === currentDateStr;
            });

            return filteredReminders.length > 0 ? (
              <ReminderList data={filteredReminders} />
            ) : null;
          })()}
        {percent >= 25 && (
          <Text className="text-lg text-center py-2" style={{ color: theme.colors.textSecondary }}>
            {t("Bạn đã hoàn thành")} {percent.toFixed(0)}% {t("mục tiêu đề ra")}
          </Text>
        )}
        {filtered && filtered.length > 0 && (
          <Text className="font-bold text-lg pb-2" style={{ color: theme.colors.textSecondary }}>
            {t("Lịch sử hôm nay")}
          </Text>
        )}
        <WaterHistory filtered={filtered ?? []} />

        <View className="flex gap-2.5 p-4 rounded-md shadow-md mb-4 mt-4" style={{ backgroundColor: theme.colors.card }}>
          <View>
            <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Tiến trình của bạn")}</Text>
            <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Hãy giữ phong độ nào !")}</Text>
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
              yAxisLabelTexts={yAxisLabelTexts}
              maxValue={displayWater(2000).value}
              xAxisLabelTextStyle={{ color: theme.colors.textPrimary }}
              yAxisTextStyle={{ color: theme.colors.textPrimary }}
              xAxisColor={theme.colors.border}
              yAxisColor={theme.colors.border}
            />
          </ScrollView>
        </View>

        <Weather
          handleUpdateGoal={() =>
            handleUpdateGoal(weatherReport?.recommended ?? 0, Date.now().toString())
          }
          weatherReport={weatherReport as WeatherResponse}
          waterStatus={waterStatus as WaterStatus}
        />
      </ScrollView>
    </View>
  );
};

export default Page;
