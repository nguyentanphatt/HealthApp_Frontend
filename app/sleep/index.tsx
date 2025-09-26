import CalendarSwiper from "@/components/CalendarSwiper";
import CircularTimePicker from "@/components/CircularTimePicker";
import { CreateSleepRecord, getSleepStatus, UpdateSleepRecord } from "@/services/sleep";
import { formatTimeForDisplay, utcTimeToVnTime, vnTimeToUtcTimestamp } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import Toast from "react-native-toast-message";

const Page = () => {
  const router = useRouter();
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

  const [selectedMood, setSelectedMood] = useState<string | null>(sleepStatus?.history[0]?.qualityScore || null);

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

  // Thức=2, ngủ=0, ngáy/ho=1
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
    { label: "Tuyệt vời", emoji: "😄", color: "#007F3D", value: 100 },
    { label: "Tốt", emoji: "🙂", color: "#6CC644", value: 80 },
    { label: "Bình thường", emoji: "😐", color: "#FFA500", value: 60 },
    { label: "Không tốt", emoji: "☹️", color: "#E74C3C", value: 40 },
    { label: "Tệ", emoji: "😡", color: "#C0392B", value: 20 },
  ];

  const handleSetSleepTime = async (startTime: string, endTime: string, isAllWeek: boolean) => {
    const startTimeHour = Number(startTime.split(":")[0]);
    const startTimeMinute = Number(startTime.split(":")[1]);
    const endTimeHour = Number(endTime.split(":")[0]);
    const endTimeMinute = Number(endTime.split(":")[1]);

    const isStartTimeNextDay = startTimeHour >= 0;
    const isEndTimeNextDay = true;

    const startTimeTimestamp = vnTimeToUtcTimestamp(startTimeHour, startTimeMinute, isStartTimeNextDay);
    const endTimeTimestamp = vnTimeToUtcTimestamp(endTimeHour, endTimeMinute, isEndTimeNextDay);
    
    try {
      const response = await CreateSleepRecord(startTimeTimestamp.toString(), endTimeTimestamp.toString(), isAllWeek);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Thêm giờ ngủ thành công",
        });
        queryClient.invalidateQueries({ queryKey: ["sleepStatus"] });
        setTimeout(() => {
          router.push("/sleep");
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Thêm giờ ngủ thất bại",
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
          <Text className="text-2xl font-bold  self-center">Giấc ngủ</Text>
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
            <Text className="text-xl">Thiết lập cho cả tuần</Text>
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
              <Text className="text-xl text-white font-bold ">Đặt giờ ngủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Khi đã có dữ liệu giấc ngủ */}
      {hasSleepData && (
        <View className="flex gap-5">
          <View className="bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4">
            <Text className="font-bold text-xl">Thời gian ngủ</Text>
            <View className="flex-row items-center justify-center gap-5 mt-3">
              <FontAwesome6 name="bed" size={24} color="black" />
              <Text className="text-2xl text-center font-bold">
                {sleepStatus?.history[0].duration} giờ
              </Text>
            </View>
            <Text className="text-lg text-black/60 text-center">
              Từ {(() => {
                const startTime = utcTimeToVnTime(new Date(sleepStatus?.history[0].startAt).getTime());
                const endTime = utcTimeToVnTime(new Date(sleepStatus?.history[0].endedAt).getTime());
                return `${formatTimeForDisplay(startTime.hour, startTime.minute)} giờ tới ${formatTimeForDisplay(endTime.hour, endTime.minute)} giờ`;
              })()}
            </Text>
          </View>

          <View className="flex gap-2.5 bg-white p-4 rounded-md shadow-md mb-4 mt-4">
            <View>
              <Text className="font-bold text-xl">Ngủ đầy đặn</Text>
              <Text className="text-black/60">Hãy giữ phong độ nào !</Text>
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
                xAxisLabelTextStyle={{ color: "black" }}
                yAxisTextStyle={{ color: "black" }}
              />
            </ScrollView>

            <View className="flex-row items-center justify-center gap-5 mt-2.5">
              <View className="flex-row items-center gap-2">
                <View className="size-4 rounded-full bg-[#3634A3]" />
                <Text className="text-lg">Ngủ</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="size-4 rounded-full bg-[#5EC8FE]" />
                <Text className="text-lg">Ngáy/Ho</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="size-4 rounded-full bg-[#003FDD]" />
                <Text className="text-lg">Thức</Text>
              </View>
            </View>
          </View>

          <View className="flex gap-2.5 bg-white p-4 rounded-md shadow-md">
            <View>
              <Text className="font-bold text-xl">Tiến trình ngủ</Text>
              <Text className="text-black/60">Ngày hôm qua bạn ngủ như thế nào !</Text>
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
                color="black"
                thickness={2}
                maxValue={3}
                noOfSections={2}
                yAxisLabelTexts={['Ngủ', 'Ngáy/Ho', 'Thức']}
                yAxisLabelWidth={50}
                yAxisTextStyle={{ color: 'black' }}
                yAxisColor="gray"
                xAxisColor="gray"
              />
            </ScrollView>


          </View>
          <View className="flex bg-white p-4 rounded-md shadow-md my-4">
            <Text className="font-bold text-xl">Ngày hôm qua bạn ngủ như thế nào !</Text>
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
                    <View className={`w-[70px] h-[70px] flex items-center justify-center transition-all duration-300 ${selectedMood === null ? "opacity-100" : selectedMood === mood.label ? "opacity-100" : "opacity-50"}`}>
                      <Text
                        className={`transition-all duration-300 ${ isSelected ? "text-[50px]" : "text-[30px]"}`}
                      >
                        {mood.emoji}
                      </Text>
                    </View>
                    <Text
                      className={`text-lg ${isSelected ? "text-cyan-blue font-bold" : "text-black"}`}
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
  );
};

export default Page;
