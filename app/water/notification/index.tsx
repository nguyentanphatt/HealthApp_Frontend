import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const Page = () => {
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState("250");
  const [selectedHour, setSelectedHour] = useState(6);
  const [selectedMinute, setSelectedMinute] = useState(30);

  const hours = Array.from({ length: 24 }, (_, i) => ({
    label: (i + 1).toString(),
    value: i,
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  const times = 9;
  const repeatedHours = Array.from({ length: times }).flatMap(() => hours);
  const middleHoursIndex = Math.floor(times / 2) * hours.length;

  const repeatedMinutes = Array.from({ length: times }).flatMap(() => minutes);
  const middleMinutesIndex = Math.floor(times / 2) * minutes.length;

  const handleSave = async (
    amount: number,
    hour: number,
    minute: number,
  ) => {
    const newTime = new Date();
    newTime.setUTCHours(hour);
    newTime.setUTCMinutes(minute);
    newTime.setUTCSeconds(0);
    newTime.setUTCMilliseconds(0);
    const timestamp = newTime.getTime();

    console.log("Saved:", {
      amount,
      time: timestamp,
    });

    /* try {
      const response = await updateWaterRecord(
        amount,
        date,
        timestamp.toString()
      );
      if (response.success) {
        Toast.show({
          type: "success",
          text1: response.message,
        });
        router.push("/water");
      }
    } catch (error) {
      console.error(error);
    } */
  };

  return (
    <View className="flex-1 gap-2.5 px-4 py-10 h-[300px] font-lato-regular">
      <View className="flex flex-row items-center justify-between py-5">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold self-center">Thêm nhắc nhở</Text>
        <View style={{ width: 24 }} />
      </View>
      <View className="flex items-center justify-center bg-white p-2 rounded-md shadow-md mb-1">
        <Text className="text-xl font-bold">Lượng nước (ml)</Text>
        <View className="border-b-2 border-black max-w-[200px] h-[50px]">
          <TextInput
            className="text-2xl font-bold"
            defaultValue={selectedAmount}
            keyboardType="numeric"
            onChangeText={(text) => setSelectedAmount(text)}
          />
        </View>
      </View>

      <Text className="text-xl font-bold">Thời gian</Text>
      <View className="flex flex-row items-center justify-center bg-white rounded-md shadow-md p-4">
        <WheelPickerExpo
          height={240}
          width={150}
          initialSelectedIndex={selectedHour-1}
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
          initialSelectedIndex={selectedMinute}
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
      <View className="flex flex-row items-center justify-center py-5">
        <TouchableOpacity
          onPress={() => handleSave(Number(selectedAmount), selectedHour, selectedMinute)}
          className="flex-row items-center justify-center w-[50%] bg-cyan-blue py-3 rounded-md shadow-md"
        >
          <Text className="text-xl text-white font-bold ">Thêm nhắc nhở</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
