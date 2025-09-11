import { updateWaterDailyGoal } from "@/services/water";
import { convertISOToTimestamp } from "@/utils/convertISOtoTimestamp";
import { FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const Page = () => {
  const router = useRouter();
  const { amount, time } = useLocalSearchParams<{
    amount: string;
    time: string;
  }>();
  
  const initAmount = Number(amount);
  const [selectedAmount, setSelectedAmount] = useState<number>(initAmount);
  const timestamp = convertISOToTimestamp(time);

  const items = Array.from({ length: (5000 - 50) / 50 + 1 }, (_, i) => {
    const amount = 50 + i * 50;
    return { label: `${amount}`, amount };
  });

  const handleGoBack = async (amount: number, time: string) => {
    try {
      const response = await updateWaterDailyGoal(amount, time);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: response.message,
        });

        router.push(`/water`);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <View className="flex-1 gap-2.5 px-4 py-10 h-[300px] font-lato-regular">
      <View className="flex flex-row items-center justify-between py-5">
        <TouchableOpacity
          onPress={() => handleGoBack(selectedAmount, timestamp.toString())}
        >
          <FontAwesome6 name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold self-center">Đặt mục tiêu</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text className="text-lg text-center text-black/60">
        Hãy luôn đặt mục tiêu uống nước mỗi ngày – vì một cơ thể khỏe mạnh bắt
        đầu từ những thói quen nhỏ nhất.
      </Text>

      <View className="flex items-center justify-center p-4 bg-white rounded-md">
        <Text className="text-2xl font-bold mb-4">
          Mục tiêu lượng nước (ml)
        </Text>
        <WheelPickerExpo
          height={240}
          width={250}
          initialSelectedIndex={items.findIndex((i) => i.amount === initAmount)}
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
          onChange={({ item }) => setSelectedAmount(item.value)}
        />
      </View>
    </View>
  );
};

export default Page;
