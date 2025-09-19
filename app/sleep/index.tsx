import CalendarSwiper from "@/components/CalendarSwiper";
import CircularTimePicker from "@/components/CircularTimePicker";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
const Page = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate ? Number(params.selectedDate) : 0
  );

  const [isEnabled, setIsEnabled] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const stackData = [
    {
      stacks: [
        { value: 4, color: '#3634A3' },
        { value: 2, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
        { value: 1, color: '#DE2F0F' },
      ],
      label: 'T2',
    },
    {
      stacks: [
        { value: 3, color: '#3634A3' },
        { value: 1, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
        { value: 3, color: '#DE2F0F' },
      ],
      label: 'T3',
    },
    {
      stacks: [
        { value: 2, color: '#3634A3' },
        { value: 2, color: '#003FDD' },
        { value: 4, color: '#5EC8FE' },
        { value: 2, color: '#DE2F0F' },
      ],
      label: 'T4',
    },
    {
      stacks: [
        { value: 4, color: '#3634A3' },
        { value: 3, color: '#003FDD' },
        { value: 1, color: '#5EC8FE' },
        { value: 2, color: '#DE2F0F' },
      ],
      label: 'T5',
    },
    {
      stacks: [
        { value: 5, color: '#3634A3' },
        { value: 1, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
        { value: 2, color: '#DE2F0F' },
      ],
      label: 'T6',
    },
    {
      stacks: [
        { value: 3, color: '#3634A3' },
        { value: 1, color: '#003FDD' },
        { value: 1, color: '#5EC8FE' },
        { value: 5, color: '#DE2F0F' },
      ],
      label: 'T7',
    },
    {
      stacks: [
        { value: 2, color: '#3634A3' },
        { value: 3, color: '#003FDD' },
        { value: 3, color: '#5EC8FE' },
        { value: 2, color: '#DE2F0F' },
      ],
      label: 'CN',
    },
  ];

  // Thức=3, N.Mơ=2, N.Nông=1, N.Sâu=0
  const data = [
    { value: 3, label: "11:00" },
    { value: 2.5, label: "0:00" },
    { value: 2, label: "1:00" },
    { value: 1, label: "2:00" },
    { value: 1.2, label: "3:00" },
    { value: 1, label: "4:00" },
    { value: 2, label: "5:00" },
    { value: 1, label: "6:00" },
    { value: 3, label: "7:00" },
  ];
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
      {/* Khi chưa chọn ngày */}
      <View className="pt-20 flex gap-5 hidden">
        <CircularTimePicker
          onChange={({ startTime, endTime }) => {
            setStartTime(startTime);
            setEndTime(endTime);
            console.log("startTime", startTime);
            console.log("endTime", endTime);
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
            //onPress={() => router.push("/food/upload" as Href)}
            className="self-center flex-row items-center justify-center w-[50%] bg-cyan-blue py-3 rounded-md shadow-md"
          >
            <Text className="text-xl text-white font-bold ">Đặt giờ ngủ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Khi đã chọn ngày */}
      <View className="flex gap-5">
        <View className="bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4">
          <Text className="font-bold text-xl">Thời gian ngủ</Text>
          <View className="flex-row items-center justify-center gap-5 mt-3">
            <FontAwesome6 name="bed" size={24} color="black" />
            <Text className="text-2xl text-center font-bold">
              12 giờ
            </Text>
          </View>
          <Text className="text-lg text-black/60 text-center">Từ 12:00 giờ tới 6:00 giờ</Text>
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

          <View className="flex gap-2.5 mt-2.5">
            <View className="flex-row items-center gap-8">
              <View className="flex-row items-center gap-2 w-[50%]">
                <View className="size-4 rounded-full bg-[#3634A3]" />
                <Text className="text-lg">Ngủ sâu (Deep Sleep)</Text>
              </View>

              <View className="flex-row items-center gap-2 w-[50%]">
                <View className="size-4 rounded-full bg-[#5EC8FE]" />
                <Text className="text-lg">Ngủ mơ (REM)</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-8">
              <View className="flex-row items-center gap-2 w-[50%]">
                <View className="size-4 rounded-full bg-[#003FDD]" />
                <Text className="text-lg">Ngủ nông (Light Sleep)</Text>
              </View>

              <View className="flex-row items-center gap-2 w-[50%]">
                <View className="size-4 rounded-full bg-[#DE2F0F]" />
                <Text className="text-lg">Thức dậy (Awake)</Text>
              </View>
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
              noOfSections={3}
              yAxisLabelTexts={['N.Sâu', 'N.Nông', 'N.Mơ', 'Thức']}
              yAxisLabelWidth={50}
              yAxisTextStyle={{ color: 'black' }}
              yAxisColor="gray"
              xAxisColor="gray"
            />
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

export default Page;
