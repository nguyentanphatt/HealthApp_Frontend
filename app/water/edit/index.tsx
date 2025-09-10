import { FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const Page = () => {
  const { amount, time } = useLocalSearchParams<{
    amount: string;
    time: string;
  }>();
  const router = useRouter();
  const initAmount = Number(amount) || 250;
  const parseIso = (isoString: string): Date => {
    return new Date(isoString);
  };
  const date = new Date(time);
  const initHour = date.getUTCHours();
  const initMinute = date.getUTCMinutes();

  const [selectedAmount, setSelectedAmount] = useState(initAmount);
  const [selectedHour, setSelectedHour] = useState(initHour);
  const [selectedMinute, setSelectedMinute] = useState(initMinute);

  const hours = Array.from({ length: 24 }, (_, i) => ({
    label: (i + 1).toString(),
    value: i,
  }));

  const minutes = Array.from({ length: 59 }, (_, i) => ({
    label: (i + 1).toString(),
    value: i + 1,
  }));

  const times = 9; 
  const repeatedHours = Array.from({ length: times }).flatMap(() => hours);
  const middleHoursIndex = Math.floor(times / 2) * hours.length;

  const repeatedMinutes = Array.from({ length: times }).flatMap(() => minutes);
  const middleMinutesIndex = Math.floor(times / 2) * minutes.length;

  const handleSave = (amount: number, hour: number, minute: number) => {
    const newTime = new Date(time);
    newTime.setUTCHours(hour);
    newTime.setUTCMinutes(minute);
    newTime.setUTCSeconds(0);
    newTime.setUTCMilliseconds(0);
    const timestamp = newTime.getTime();

    console.log("Saved:", {
      amount,
      time: timestamp,
    });

    //router.back();
  };

  return (
    <View className="flex-1 gap-2.5 px-4 py-10 h-[300px] font-lato-regular">
      <View className="flex flex-row items-center justify-between py-5">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold self-center">Chỉnh sửa</Text>
        <View style={{ width: 24 }} />
      </View>
      <View className="flex items-center justify-center bg-white p-2 rounded-md shadow-md mb-1">
        <Text className="text-xl font-bold">Lượng nước (ml)</Text>
        <View className="border-b-2 border-black max-w-[200px] h-[50px]">
          <TextInput
            className="text-2xl font-bold"
            defaultValue={amount}
            keyboardType="numeric"
            onChangeText={(text) => setSelectedAmount(Number(text))}
          />
        </View>
      </View>

      <Text className="text-xl font-bold">Thời gian</Text>
      <View className="flex flex-row items-center justify-center bg-white rounded-md shadow-md p-4">
        <WheelPickerExpo
          height={240}
          width={150}
          initialSelectedIndex={middleHoursIndex + initHour - 1}
          items={repeatedHours}
          selectedStyle={{
            borderColor: "gray",
            borderWidth: 0,
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
          onChange={({ item }) => setSelectedHour(item.value)}
        />

        <Text style={{ fontSize: 32, fontWeight: "600", marginHorizontal: 8 }}>
          :
        </Text>

        <WheelPickerExpo
          height={240}
          width={150}
          initialSelectedIndex={middleMinutesIndex + initHour - 1}
          items={repeatedMinutes}
          selectedStyle={{
            borderColor: "gray",
            borderWidth: 0,
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
          onChange={({ item }) => setSelectedMinute(item.value)}
        />
      </View>
      <View className="flex flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center justify-center w-[45%] bg-white py-3 rounded-md shadow-md"
        >
          <Text className="text-xl text-black font-bold ">Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleSave(Number(selectedAmount), selectedHour, selectedMinute);
          }}
          className="flex-row items-center justify-center w-[45%] bg-cyan-blue py-3 rounded-md shadow-md"
        >
          <Text className="text-xl text-white font-bold ">Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
