import CalendarSwiper from "@/components/CalendarSwiper";
import CircularTimePicker from "@/components/CircularTimePicker";
import { useAppTheme } from "@/context/appThemeContext";
import { CreateSleepRecord, getSleepStatus, UpdateSleepRecord, saveSleepPoint } from "@/services/sleep";
import { formatTimeForDisplay, utcTimeToVnTime, vnDateAndTimeToUtcTimestamp, vnTimeToUtcTimestamp } from "@/utils/convertTime";
import { scheduleSleepNotification } from "@/utils/notificationsHelper";
import { FontAwesome6 } from "@expo/vector-icons";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import Toast from "react-native-toast-message";
import {screenMonitor} from "@/services/screenMonitor";

const Page = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate ? Number(params.selectedDate) : 0
  );

  const [isEnabled, setIsEnabled] = useState(false);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("6:00");


  const {
    data: sleepStatus,
    isLoading: loadingSleepStatus,
    refetch: refetchSleepStatus,
  } = useQuery({
    queryKey: ["sleepStatus", {date:selectedDate}],
    queryFn: () =>
      getSleepStatus(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });

  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    const currentTimestamp = selectedDate || Math.floor(Date.now() / 1000);
    const prevTimestamp = currentTimestamp - 86400;
    const nextTimestamp = currentTimestamp + 86400;

    queryClient.prefetchQuery({
      queryKey: ["sleepStatus", {date:prevTimestamp}],
      queryFn: () =>
        getSleepStatus({ date: (prevTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ["sleepStatus", {date:nextTimestamp}],
      queryFn: () =>
        getSleepStatus({ date: (nextTimestamp * 1000).toString() }),
      staleTime: 1000 * 60 * 5,
    });

  }, [selectedDate, queryClient]);


  const hasSleepData = sleepStatus?.history && (sleepStatus.history as any[]).length > 0;

  useEffect(() => {
    if (hasSleepData && sleepStatus?.history?.[0]) {
      const sleepRecord = sleepStatus.history[0];
      const recordId = sleepRecord.recordId;
      const startTime = utcTimeToVnTime(new Date(sleepRecord.startAt).getTime());
      const endTime = utcTimeToVnTime(new Date(sleepRecord.endedAt).getTime());

      const startTimeStr = `${String(startTime.hour).padStart(2, '0')}:${String(startTime.minute).padStart(2, '0')}`;
      const endTimeStr = `${String(endTime.hour).padStart(2, '0')}:${String(endTime.minute).padStart(2, '0')}`;

      // Callback function to save sleep points
      const handleSaveSleepPoint = async (type: 'sleep' | 'awake', timestamp: number) => {
        try {
          const response = await saveSleepPoint(type, timestamp.toString(), recordId);
          if (response.success) {
            console.log(`[Sleep Screen] Sleep point saved: ${type} at ${new Date(timestamp).toLocaleString('vi-VN')}`);
            // Optionally show a subtle toast notification
            // Toast.show({
            //   type: "info",
            //   text1: t(`Đã ghi nhận ${type === 'sleep' ? 'ngủ' : 'thức'}`),
            //   position: "bottom",
            //   visibilityTime: 2000,
            // });
          }
        } catch (error) {
          console.error(`[Sleep Screen] Failed to save sleep point:`, error);
          Toast.show({
            type: "error",
            text1: t("Không thể lưu dữ liệu giấc ngủ"),
            text2: t("Vui lòng kiểm tra kết nối"),
            position: "bottom",
            visibilityTime: 3000,
          });
          throw error; // Re-throw to trigger retry logic in screenMonitor
        }
      };

      // Start screen monitoring with recordId and callback
      screenMonitor.startTracking(startTimeStr, endTimeStr, recordId, handleSaveSleepPoint);

      return () => {
        const logs = screenMonitor.stopTracking();
        console.log('[Sleep Screen] Final logs:', logs);

        // Check if there are pending requests
        const pendingRequests = screenMonitor.getPendingRequests();
        if (pendingRequests.length > 0) {
          console.log('[Sleep Screen] Still have pending requests:', pendingRequests.length);
          Toast.show({
            type: "warning",
            text1: t("Đang lưu dữ liệu"),
            text2: t("Vui lòng đợi..."),
            position: "bottom",
          });
        }
      };
    }
  }, [hasSleepData, sleepStatus?.history?.[0], t]);

  const stackData = [
    {
      stacks: [
        { value: 4, color: '#3634A3' },
        { value: 2, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
      ],
      label: 'T2',
    },
    {
      stacks: [
        { value: 3, color: '#3634A3' },
        { value: 1, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
      ],
      label: 'T3',
    },
    {
      stacks: [
        { value: 2, color: '#3634A3' },
        { value: 2, color: '#003FDD' },
        { value: 4, color: '#5EC8FE' },
      ],
      label: 'T4',
    },
    {
      stacks: [
        { value: 4, color: '#3634A3' },
        { value: 3, color: '#003FDD' },
        { value: 1, color: '#5EC8FE' },
      ],
      label: 'T5',
    },
    {
      stacks: [
        { value: 5, color: '#3634A3' },
        { value: 1, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
      ],
      label: 'T6',
    },
    {
      stacks: [
        { value: 3, color: '#3634A3' },
        { value: 1, color: '#003FDD' },
        { value: 1, color: '#5EC8FE' },
      ],
      label: 'T7',
    },
    {
      stacks: [
        { value: 2, color: '#3634A3' },
        { value: 3, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
      ],
      label: 'CN',
    },
  ];

  const data = [
    { value: 2, label: "11:00" },
    { value: 0, label: "0:00" },
    { value: 2, label: "1:00" },
    { value: 1, label: "2:00" },
    { value: 0, label: "3:00" },
    { value: 0, label: "4:00" },
    { value: 2, label: "5:00" },
    { value: 1, label: "6:00" },
    { value: 2, label: "7:00" },
  ];

  const moods = [
    { label: t("Tuyệt vời"), emoji: "😄", color: "#007F3D", value: 100 },
    { label: t("Tốt"), emoji: "🙂", color: "#6CC644", value: 80 },
    { label: t("Bình thường"), emoji: "😐", color: "#FFA500", value: 60 },
    { label: t("Không tốt"), emoji: "☹️", color: "#E74C3C", value: 40 },
    { label: t("Tệ"), emoji: "😡", color: "#C0392B", value: 20 },
  ];

  useEffect(() => {
    if (sleepStatus?.history?.[0]?.qualityScore) {
      const qualityScore = sleepStatus.history[0].qualityScore;
      const matchingMood = moods.find(m => 
        m.label === qualityScore || 
        qualityScore.includes(m.label) ||
        m.label.includes(qualityScore)
      );
      if (matchingMood) {
        setSelectedMood(matchingMood.label);
      }
    } else {
      setSelectedMood(null);
    }
  }, [sleepStatus?.history?.[0]?.qualityScore, moods]);

  // Schedule notification when sleep data exists
  useEffect(() => {
    if (sleepStatus?.history?.[0]) {
      const sleepRecord = sleepStatus.history[0];
      const startTime = utcTimeToVnTime(new Date(sleepRecord.startAt).getTime());
      const endTime = utcTimeToVnTime(new Date(sleepRecord.endedAt).getTime());

      const startTimeStr = `${String(startTime.hour).padStart(2, '0')}:${String(startTime.minute).padStart(2, '0')}`;
      const endTimeStr = `${String(endTime.hour).padStart(2, '0')}:${String(endTime.minute).padStart(2, '0')}`;

      // Only schedule if we're viewing today's data (selectedDate is 0 or today)
      const isToday = selectedDate === 0 ||
        Math.abs(selectedDate - Math.floor(Date.now() / 1000)) < 86400;

      if (isToday) {
        scheduleSleepNotification(startTimeStr, endTimeStr).then(success => {
          if (success) {
            console.log("Sleep notification re-scheduled on load");
          }
        });
      }
    }
  }, [sleepStatus?.history?.[0], selectedDate]);

  const handleSetSleepTime = async (startTime: string, endTime: string, isAllWeek: boolean) => {
    const startTimeHour = Number(startTime.split(":")[0]);
    const startTimeMinute = Number(startTime.split(":")[1]);
    const endTimeHour = Number(endTime.split(":")[0]);
    const endTimeMinute = Number(endTime.split(":")[1]);

    const isStartTimeNextDay = startTimeHour === 0;
    const isEndTimeNextDay = true;

    const startTimeTimestamp = selectedDate
      ? vnDateAndTimeToUtcTimestamp(selectedDate, startTimeHour, startTimeMinute, isStartTimeNextDay)
      : vnTimeToUtcTimestamp(startTimeHour, startTimeMinute, isStartTimeNextDay);
    const endTimeTimestamp = selectedDate
      ? vnDateAndTimeToUtcTimestamp(selectedDate, endTimeHour, endTimeMinute, isEndTimeNextDay)
      : vnTimeToUtcTimestamp(endTimeHour, endTimeMinute, isEndTimeNextDay);
    console.log("selectedDate", selectedDate);
    
    console.log("startTimeTimestamp", startTimeTimestamp);
    console.log("endTimeTimestamp", endTimeTimestamp);
    

    try {
      const response = await CreateSleepRecord(startTimeTimestamp.toString(), endTimeTimestamp.toString(), isAllWeek);
      if (response.success) {
        // Schedule sleep notification
        const notificationScheduled = await scheduleSleepNotification(startTime, endTime);
        if (notificationScheduled) {
          console.log("Sleep notification scheduled successfully");
        }

        Toast.show({
          type: "success",
          text1: t("Thêm giờ ngủ thành công"),
        });
        refetchSleepStatus();
        setTimeout(() => {
          router.push("/sleep");
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: t("Thêm giờ ngủ thất bại"),
      });
    }

  };

  const handleUpdateMood = async (recordId: string, qualityScore: string) => {
    try {
      const response = await UpdateSleepRecord(recordId, { qualityScore: qualityScore });
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["sleepStatus"] });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loading = loadingSleepStatus
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  console.log("sleepStatus", sleepStatus?.history[0]);
  

  return (
    <View className="flex-1 pt-12" style={{ backgroundColor: theme.colors.background }}>
      <View className="flex px-4 py-5">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Giấc ngủ")}</Text>
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
      className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular"
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Khi chưa có dữ liệu giấc ngủ */}
      {!hasSleepData && (
        <View className="pt-20 flex gap-5">
          <CircularTimePicker
            onChange={({ startTime, endTime }) => {
              setStartTime(startTime);
              setEndTime(endTime); 
            }}
          />
          <View className="flex-row items-center gap-10">
            <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{t("Thiết lập cho cả tuần")}</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: "#00000066", true: "#19B1FF" }}
              thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              className="scale-125"
            />
          </View>

          <View className="flex flex-row items-center justify-center py-5">
            <TouchableOpacity
              onPress={() => handleSetSleepTime(startTime, endTime, isEnabled)}
              className="self-center flex-row items-center justify-center w-[50%] bg-cyan-blue py-3 rounded-md shadow-md"
            >
              <Text className="text-xl font-bold " style={{ color: theme.colors.textPrimary }}>{t("Đặt giờ ngủ")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Khi đã có dữ liệu giấc ngủ */}
      {hasSleepData && (
        <View className="flex gap-5">
          <View className="rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4" style={{ backgroundColor: theme.colors.card }}>
            <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Thời gian ngủ")}</Text>
            <View className="flex-row items-center justify-center gap-5 mt-3">
              <FontAwesome6 name="bed" size={24} color={theme.colors.textPrimary} />
              <Text className="text-2xl text-center font-bold" style={{ color: theme.colors.textPrimary }}>
                {sleepStatus?.history[0].duration} {t("giờ")}
              </Text>
            </View>
            <Text className="text-lg text-center" style={{ color: theme.colors.textSecondary }}>
              {t("Từ")} {(() => {
                const startTime = utcTimeToVnTime(new Date(sleepStatus?.history[0].startAt).getTime());
                const endTime = utcTimeToVnTime(new Date(sleepStatus?.history[0].endedAt).getTime());
                return `${formatTimeForDisplay(startTime.hour, startTime.minute)} ${t("tới")} ${formatTimeForDisplay(endTime.hour, endTime.minute)}`;
              })()}
            </Text>
          </View>

          <View className="flex gap-2.5 p-4 rounded-md shadow-md mb-4 mt-4" style={{ backgroundColor: theme.colors.card }}>
            <View>
              <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Ngủ đầy đặn")}</Text>
              <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Hãy giữ phong độ nào !")}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
            >
              <BarChart
                stackData={stackData}
                barWidth={24}
                frontColor="#00BFFF"
                noOfSections={4}
                yAxisLabelTexts={["0", "5", "10", "15"]}
                xAxisLabelTextStyle={{ color: theme.colors.textPrimary }}
                yAxisTextStyle={{ color: theme.colors.textPrimary }}
              />
            </ScrollView>

            <View className="flex-row items-center justify-center gap-5 mt-2.5">
              <View className="flex-row items-center gap-2">
                <View className="size-4 rounded-full bg-[#3634A3]" />
                <Text className="text-lg" style={{ color: theme.colors.textPrimary }}>{t("Ngủ")}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="size-4 rounded-full bg-[#5EC8FE]" />
                <Text className="text-lg" style={{ color: theme.colors.textPrimary }}>{t("Ngáy/Ho")}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="size-4 rounded-full bg-[#003FDD]" />
                <Text className="text-lg" style={{ color: theme.colors.textPrimary }}>{t("Thức")}</Text>
              </View>
            </View>
          </View>

          <View className="flex gap-2.5 p-4 rounded-md shadow-md" style={{ backgroundColor: theme.colors.card }}>
            <View>
              <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Tiến trình ngủ")}</Text>
              <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Ngày hôm qua bạn ngủ như thế nào !")}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
            >
              <LineChart
                data={data}
                curved={false}
                height={200}
                spacing={60}
                initialSpacing={20}
                color={theme.colors.textPrimary}
                thickness={2}
                maxValue={3}
                noOfSections={2}
                yAxisLabelTexts={['Ngủ', 'Ngáy/Ho', 'Thức']}
                yAxisLabelWidth={50}
                yAxisTextStyle={{ color: theme.colors.textPrimary }}
                yAxisColor={theme.colors.border}
                xAxisColor={theme.colors.border}
                xAxisLabelTextStyle={{ color: theme.colors.textPrimary }}
                dataPointsColor={theme.colors.textPrimary}
              />
            </ScrollView>


          </View>
          <View className="flex p-4 rounded-md shadow-md my-4" style={{ backgroundColor: theme.colors.card }}>
            <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{t("Bạn đánh giá như thế nào !")}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 8,
                alignItems: 'center',
                gap: 20
              }}
              style={{ marginTop: 16 }}
            >
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.label;
                return (
                  <TouchableOpacity
                    key={mood.label}
                     onPress={() => (setSelectedMood(mood.label), handleUpdateMood(sleepStatus?.history[0].recordId, mood.value.toString()))}
                    className="flex items-center gap-1"
                  >
                    <View 
                      className={`w-[70px] h-[70px] flex items-center justify-center ${selectedMood === null ? "opacity-100" : selectedMood === mood.label ? "opacity-100" : "opacity-50"}`}
                      style={{ opacity: selectedMood === null ? 1 : selectedMood === mood.label ? 1 : 0.5 }}
                    >
                      <Text
                        className={isSelected ? "text-[50px]" : "text-[30px]"}
                        style={{ fontSize: isSelected ? 50 : 30 }}
                      >
                        {mood.emoji}
                      </Text>
                    </View>
                    <Text
                      className={`text-lg ${isSelected ? "text-cyan-blue font-bold" : "text-primary"}`}
                      style={{ color: isSelected ? theme.colors.tint : theme.colors.textPrimary }}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
          
        </View>
      )}
    </ScrollView>
    </View>
  );
};

export default Page;
