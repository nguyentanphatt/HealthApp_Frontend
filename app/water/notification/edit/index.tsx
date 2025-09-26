import { useUnits } from "@/hooks/useUnits";
import { updateWaterReminder } from "@/services/water";
import { convertWater } from "@/utils/convertMeasure";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const Page = () => {
  const { id, message, expiresIn } = useLocalSearchParams<{
    id: string;
    message: string;
    expiresIn: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { units, inputToBaseWater } = useUnits();
  const initAmount = Number(message) || 250;
  const initialValue =
    units.water === "ml"
      ? initAmount
      : Number(convertWater(initAmount, units.water).toFixed(2));
  const dateTimestamp = convertISOToTimestamp(expiresIn);
  const date = new Date(expiresIn);
  const initHour = date.getUTCHours();
  const initMinute = date.getUTCMinutes();

  const [selectedAmount, setSelectedAmount] = useState(initialValue);
  const [selectedHour, setSelectedHour] = useState(initHour);
  const [selectedMinute, setSelectedMinute] = useState(initMinute);
  const [visible, setVisible] = useState(false);

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
    date: string,
    id: string
  ) => {
    const newTime = new Date(expiresIn);
    newTime.setUTCHours(hour + 1);
    newTime.setUTCMinutes(minute);
    newTime.setUTCSeconds(0);
    newTime.setUTCMilliseconds(0);
    const timestamp = newTime.getTime();
    const valueInMl =
      inputToBaseWater(amount);
    console.log("Saved:", {
      amount: valueInMl,
      time: timestamp,
      hour,
      minute,
      id,
    });

    try {
      const response = await updateWaterReminder(
        id,
        valueInMl.toString(),
        timestamp.toString(),
        true
      );
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["waterStatus"] });
        queryClient.invalidateQueries({ queryKey: ["waterReminder"] });
        Toast.show({
          type: "success",
          text1: "Thành công",
        });
        router.push("/water");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isChanged =
    initAmount !== selectedAmount &&
    initHour !== selectedHour &&
    initMinute !== selectedMinute;
  useEffect(() => {
    const backAction = () => {
      if (isChanged) {
        setVisible(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isChanged]);

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
            defaultValue={initialValue.toString()}
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
          initialSelectedIndex={middleMinutesIndex + initMinute}
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
            handleSave(
              Number(selectedAmount),
              selectedHour,
              selectedMinute,
              dateTimestamp.toString(),
              id
            );
          }}
          className="flex-row items-center justify-center w-[45%] bg-cyan-blue py-3 rounded-md shadow-md"
        >
          <Text className="text-xl text-white font-bold ">Sửa</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/30">
          <View className="flex items-center justify-center p-4 bg-white w-[90%] rounded-md">
            <Text className="text-lg font-bold mb-4">
              Dữ liệu chưa được lưu, bạn có muốn thoát ?
            </Text>

            <View className="flex flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full"
              >
                <Text className="text-xl text-black font-bold ">Thoát</Text>
              </TouchableOpacity>
              <Text>|</Text>
              <TouchableOpacity
                onPress={() =>
                  handleSave(
                    Number(selectedAmount),
                    selectedHour,
                    selectedMinute,
                    dateTimestamp.toString(),
                    id
                  )
                }
                className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full"
              >
                <Text className="text-xl text-black font-bold ">Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Page;
