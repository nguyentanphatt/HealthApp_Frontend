import CalendarSwiper from "@/components/CalendarSwiper";
import InfoCard from "@/components/InfoCard";
import ReminderList from "@/components/ReminderList";
import WaterVector from "@/components/vector/WaterVector";
import WaterHistory from "@/components/WaterHistory";
import Weather from "@/components/Weather";
import { useUnits } from "@/context/unitContext";
import {
  getIp,
  getWaterReminder,
  getWaterStatus,
  saveWaterRecord,
  updateWaterDailyGoal,
  WaterWeekly,
  WeatherSuggest,
} from "@/services/water";
import { convertWater, toBaseWater } from "@/utils/convertMeasure";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Toast from "react-native-toast-message";
import WheelPickerExpo from "react-native-wheel-picker-expo";
dayjs.extend(utc);
dayjs.extend(timezone);
const Page = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { units } = useUnits();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate ? Number(params.selectedDate) : 0
  );
  const currentDate = Date.now();
  const initialValue =
    units.water === "ml"
      ? 360
      : Number(convertWater(360, units.water).toFixed(2));

  const [amount, setAmount] = useState(initialValue);
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
    queryKey: ["waterStatus", selectedDate],
    queryFn: () =>
      getWaterStatus(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data,
  });

  const {
    data: weatherReport,
    isLoading: loadingWeather,
    refetch: refetchWeather,
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
    queryKey: ["waterWeekly", selectedDate],
    queryFn: () =>
      WaterWeekly(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
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
    select: (res) => res.data,
  });

  useEffect(() => {
    const currentTimestamp = selectedDate || Math.floor(Date.now() / 1000);
    const prevTimestamp = currentTimestamp - 86400;
    const nextTimestamp = currentTimestamp + 86400;

    queryClient.prefetchQuery({
      queryKey: ["waterStatus", prevTimestamp],
      queryFn: () =>
        getWaterStatus({ date: (prevTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["waterStatus", nextTimestamp],
      queryFn: () =>
        getWaterStatus({ date: (nextTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["waterWeekly", prevTimestamp],
      queryFn: () => WaterWeekly({ date: (prevTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["waterWeekly", nextTimestamp],
      queryFn: () => WaterWeekly({ date: (nextTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });

    if (selectedDate === 0) {
      const todayTimestamp = Math.floor(Date.now() / 1000);
      queryClient.prefetchQuery({
        queryKey: ["waterWeekly", todayTimestamp],
        queryFn: () =>
          WaterWeekly({ date: (todayTimestamp * 1000).toString() }),
        staleTime: 1000 * 60 * 5,
      });
    }

    queryClient.prefetchQuery({
      queryKey: ["waterReminder"],
      queryFn: () => getWaterReminder(),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
  }, [selectedDate, queryClient]);

  const loading =
    loadingWaterStatus || loadingWeather || loadingWeekly || loadingReminder;

  const handleConfirm = async (amount: number, time: string) => {
    const valueInMl = units.water === "ml" ? amount : toBaseWater(amount, units.water); 
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

  if (
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
  }

  const filtered = waterStatus.history.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const percent =
    ((waterStatus.currentIntake ?? 0) / (waterStatus.dailyGoal ?? 1)) * 100;

  const data = waterWeeklyData.map((item) => ({
    value: convertWater(item.totalMl, units.water),
    label: item.dayOfWeek,
  }));

  const baseLabels = [0, 500, 1000, 1500, 2000];
  const yAxisLabelTexts = baseLabels.map((val) =>
    convertWater(val, units.water).toString()
  );

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
          <Text className="text-2xl font-bold  self-center">Nước</Text>
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
      <View className="flex-row">
        <View className="relative flex-1 items-center justify-center bg-white rounded-md shadow-md mr-1">
          <WaterVector
            progress={
              waterStatus
                ? (waterStatus.currentIntake / waterStatus.dailyGoal) * 100
                : 0
            }
            animated={true}
          />
          <Text className="absolute top-2 right-2 text-black text-lg">
            - {convertWater(waterStatus?.dailyGoal || 0, units.water)}{" "}
            {units.water}
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
              title="Mục tiêu"
              content={
                `${convertWater(waterStatus?.dailyGoal || 0, units.water)} ${units.water}` ||
                `${convertWater(2000, units.water)} ${units.water}`
              }
            />
          </TouchableOpacity>
          <InfoCard
            title="Tiến độ"
            content={
              `${convertWater(waterStatus?.currentIntake || 0, units.water)} ` ||
              `${convertWater(0, units.water)} ${units.water}`
            }
            subcontent={
              ` / ${convertWater(waterStatus?.dailyGoal || 0, units.water)} ${units.water}` ||
              `${convertWater(2000, units.water)} ${units.water}`
            }
          />
          <TouchableOpacity
            onPress={() => router.push("/water/notification" as Href)}
            className="flex flex-row items-center justify-center gap-2.5 bg-white p-2 rounded-md shadow-md h-[70px]"
          >
            <FontAwesome6 name="calendar" size={24} color="black" />
            <Text className="text-xl">Nhắc nhở tôi</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex items-center justify-center py-4">
        <TouchableOpacity
          className="self-center flex-row items-center justify-center w-[70%] py-3 bg-cyan-blue rounded-full"
          onPress={() => setVisible(true)}
        >
          <Text className="text-xl text-white">Thêm</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center bg-black/30">
          <View className="flex items-center justify-center p-4 bg-white w-[90%] rounded-md">
            <Text className="text-2xl font-bold mb-4">
              Lượng nước uống ({units.water})
            </Text>
            <WheelPickerExpo
              height={240}
              width={250}
              initialSelectedIndex={items.findIndex((i) => i.amount === initialValue)}
              items={items.map((item) => ({
                label: item.label,
                value: item.amount,
              }))}
              selectedStyle={{
                borderColor: "gray",
                borderWidth: 0.5,
              }}
              renderItem={({ label }) => {
                return (
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "500",
                    }}
                  >
                    {label}
                  </Text>
                );
              }}
              onChange={({ item }) => setAmount(item.value)}
            />

            <TouchableOpacity
              onPress={() => {
                handleConfirm(amount, currentDate.toString());
                setVisible(false);
              }}
              className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full"
            >
              <Text className="text-xl text-black font-bold ">Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
        <Text className="text-lg text-center text-black/60 py-2">
          {" "}
          Bạn đã hoàn thành {percent.toFixed(0)}% mục tiêu đề ra{" "}
        </Text>
      )}
      {filtered.length > 0 && (
        <Text className="font-bold text-lg text-black/60 pb-2">
          Lịch sử hôm nay
        </Text>
      )}
      <WaterHistory filtered={filtered} />

      <View className="flex gap-2.5 bg-white p-4 rounded-md shadow-md mb-4 mt-4">
        <View>
          <Text className="font-bold text-xl">Tiến trình của bạn</Text>
          <Text className="text-black/60">Hãy giữ phong độ nào !</Text>
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
            maxValue={convertWater(2000, units.water)}
            xAxisLabelTextStyle={{ color: "black" }}
            yAxisTextStyle={{ color: "black" }}
          />
        </ScrollView>
      </View>

      <Weather
        handleUpdateGoal={() =>
          handleUpdateGoal(weatherReport.recommended, Date.now().toString())
        }
        weatherReport={weatherReport}
        waterStatus={waterStatus}
      />
    </ScrollView>
  );
};

export default Page;
