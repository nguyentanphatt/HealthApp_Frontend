import { useUnits } from "@/hooks/useUnits";
import { updateWaterDailyGoal } from "@/services/water";
import { convertWater } from "@/utils/convertMeasure";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const Page = () => {
  const router = useRouter();
  const { amount, time } = useLocalSearchParams<{
    amount: string;
    time: string;
  }>();

  const {units, inputToBaseWater} = useUnits()
  const initAmount = Number(amount);
  const { t } = useTranslation();
  const initialValue =
    units.water === "ml" ? initAmount : Number(convertWater(initAmount, units.water).toFixed(2));

  const queryClient = useQueryClient()
  const [selectedAmount, setSelectedAmount] = useState<number>(initialValue);
  const timestamp = convertISOToTimestamp(time);

  const items =
    units.water === "ml"
      ? Array.from({ length: (5000 - 50) / 50 + 1 }, (_, i) => {
          const amount = 50 + i * 50;
          return { label: `${amount}`, value: amount };
        })
      : Array.from({ length: (170 - 2) / 2 + 1 }, (_, i) => {
          const amount = 2 + i * 2;
          return { label: `${amount}`, value: amount };
        });

  const handleGoBack = async (amount: number, time: string) => {
    const valueInMl = inputToBaseWater(amount);
    try {
      const response = await updateWaterDailyGoal(valueInMl, time);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["waterStatus"] });
        Toast.show({
          type: "success",
          text1: t(response.message),
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
        <Text className="text-2xl font-bold self-center">{t("Đặt mục tiêu")}</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text className="text-lg text-center text-black/60 min-h-[70px]">
        {t("Hãy luôn đặt mục tiêu uống nước mỗi ngày – vì một cơ thể khỏe mạnh bắt đầu từ những thói quen nhỏ nhất.")}
      </Text>

      <View className="flex items-center justify-center p-4 bg-white rounded-md">
        <Text className="text-2xl font-bold mb-4">
             {t("Mục tiêu lượng nước")} ({units.water})
        </Text>
        <WheelPickerExpo
          height={240}
          width={250}
          initialSelectedIndex={items.findIndex((i) => i.value === initAmount)}
          items={items.map((item) => ({
            label: item.label,
            value: item.value,
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
