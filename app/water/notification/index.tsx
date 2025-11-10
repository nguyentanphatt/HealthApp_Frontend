import TimeWheelPicker from "@/components/TimeWheelPicker";
import { useAppTheme } from "@/context/appThemeContext";
import { useUnits } from "@/hooks/useUnits";
import { createWaterReminder } from "@/services/water";
import { convertWater } from "@/utils/convertMeasure";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

const Page = () => {
  const { theme } = useAppTheme();
  const router = useRouter();
  const {units, inputToBaseWater} = useUnits()
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const initialValue =
      units.water === "ml"
        ? 360
        : Number(convertWater(250, units.water).toFixed(2));

  const [selectedAmount, setSelectedAmount] = useState(initialValue);
  const [selectedHour, setSelectedHour] = useState(6);
  const [selectedMinute, setSelectedMinute] = useState(30);

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
  	 if (newTime.getUTCHours() >= 17) {
	   newTime.setDate(newTime.getDate()+1);
	 }
  const timestamp = newTime.getTime();
    const valueInMl = inputToBaseWater(amount); 
    console.log("Saved:", {
    amount: valueInMl,
    time: newTime,
    hour,
    minute,
  });
    try {
      const response = await createWaterReminder(
        valueInMl.toString(),
        timestamp.toString(),
        true
      );
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["waterReminder"] });
        Toast.show({
          type: "success",
          text1: "Thêm nhắc nhở thành công",
        });
        router.push("/water");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 gap-2.5 px-4 pt-12 h-[300px] font-lato-regular">
      <View className="flex flex-row items-center justify-between py-5">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold self-center" style={{ color: theme.colors.textPrimary }}>{t("Thêm nhắc nhở")}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View className="flex items-center justify-center p-2 rounded-md shadow-md mb-1" style={{ backgroundColor: theme.colors.card }}>
        <Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{t("Lượng nước")} ({units.water})</Text>
        <View className="border-b-2 border-black max-w-[200px] h-[50px]" style={{ borderColor: theme.colors.border }}>
          <TextInput
            className="text-2xl font-bold"
            defaultValue={selectedAmount.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setSelectedAmount(Number(text))}
            style={{ color: theme.colors.textPrimary }}
          />
        </View>
      </View>

      <Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{t("Thời gian")}</Text>
      <View className="flex flex-row items-center justify-center rounded-md shadow-md p-4" style={{ backgroundColor: theme.colors.card }}>
        <TimeWheelPicker
          initialHour={selectedHour}
          initialMinute={selectedMinute}
          onChange={(hour, minute) => {
            setSelectedHour(hour-1);
            setSelectedMinute(minute);
          }}
        />
      </View>
      <View className="flex flex-row items-center justify-center py-5">
        <TouchableOpacity
          onPress={() => handleSave(Number(selectedAmount), selectedHour-7, selectedMinute)}
          className="flex-row items-center justify-center w-[50%] bg-cyan-blue py-3 rounded-md shadow-md"
        >
          <Text className="text-xl text-white font-bold ">{t("Thêm nhắc nhở")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
