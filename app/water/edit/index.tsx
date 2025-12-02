import TimeWheelPicker from "@/components/TimeWheelPicker";
import { useAppTheme } from "@/context/appThemeContext";
import { useUnits } from "@/hooks/useUnits";
import { updateWaterRecord } from "@/services/water";
import { useModalStore } from "@/stores/useModalStore";
import { convertWater } from "@/utils/convertMeasure";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const Page = () => {
  const { theme } = useAppTheme();
  const { openModal } = useModalStore();
  const { amount, time, type } = useLocalSearchParams<{
    amount: string;
    time: string;
    type: string;
  }>();
  const queryClient = useQueryClient();

  const { units, inputToBaseWater } = useUnits();
  const initAmount = Number(amount) || 250;
  const initialValue =
    units.water === "ml"
      ? initAmount
      : Number(convertWater(initAmount, units.water).toFixed(2));
  const router = useRouter();
  const { t } = useTranslation();
  const dateTimestamp = convertISOToTimestamp(time);
  const date = new Date(time);
  const initHour = date.getUTCHours();
  const initMinute = date.getUTCMinutes();

  const [selectedAmount, setSelectedAmount] = useState(initialValue);
  const [selectedHour, setSelectedHour] = useState(initHour);
  const [selectedMinute, setSelectedMinute] = useState(initMinute);


  const handleSave = async (
    amount: number,
    hour: number,
    minute: number,
    date: string,
    type: string
  ) => {
    const newTime = new Date(time);
    newTime.setUTCHours(hour);
    newTime.setUTCMinutes(minute);
    newTime.setUTCSeconds(0);
    newTime.setUTCMilliseconds(0);
    const timestamp = newTime.getTime();
    const valueInMl = inputToBaseWater(amount);
    const rightTime = timestamp - 6 * 60 * 60 * 1000;
    console.log("Saved:", {
      amount: valueInMl,
      time: rightTime,
      oldTime: date,
    });


    try {
      if (type === "history") {
        const response = await updateWaterRecord(
          valueInMl,
          date,
          rightTime.toString()
        );
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ["waterStatus"] });
          console.log("response", response);
          
          router.push("/water");
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const isChanged =
    initAmount !== selectedAmount ||
    initHour !== selectedHour ||
    initMinute !== selectedMinute;
  useEffect(() => {
    const backAction = () => {
      if (isChanged) {
        openModal("action", {
          title: t("Dữ liệu chưa được lưu, bạn có muốn thoát ?"),
          options: [
            { label: t("Thoát"), onPress: () => router.push("/water" as Href), backgroundColor: "#ef4444", textColor: "white" },
            { label: t("Lưu"), onPress: () => handleSave(Number(selectedAmount), selectedHour, selectedMinute, dateTimestamp.toString(), type), backgroundColor: "#19B1FF", textColor: "white" },
          ]
        });
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
    <View className="flex-1 gap-2.5 px-4 pt-12 h-[300px] font-lato-regular">
      <View className="flex flex-row items-center justify-between py-5">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold self-center" style={{ color: theme.colors.textPrimary }}>{t("Chỉnh sửa")}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View className="flex items-center justify-center p-2 rounded-md shadow-md mb-1" style={{ backgroundColor: theme.colors.card }}>
        <Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{t("Lượng nước")} ({units.water})</Text>
        <View className="border-b-2 border-black max-w-[200px] h-[50px]" style={{ borderColor: theme.colors.border }}>
          <TextInput
            className="text-2xl font-bold"
            defaultValue={initialValue.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setSelectedAmount(Number(text))}
            style={{ color: theme.colors.textPrimary }}
          />
        </View>
      </View>

      <Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{t("Thời gian")}</Text>
      <View className="flex flex-row items-center justify-center rounded-md shadow-md p-4" style={{ backgroundColor: theme.colors.card }}>
        <TimeWheelPicker
          initialHour={initHour}
          initialMinute={initMinute}
          onChange={(hour, minute) => {
            setSelectedHour(hour-1);
            setSelectedMinute(minute);
          }}
        />
      </View>
      <View className="flex flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center justify-center w-[45%] py-3 rounded-md shadow-md" style={{ backgroundColor: theme.colors.card }}
        >
          <Text className="text-xl text-black font-bold " style={{ color: theme.colors.textPrimary }}>{t("Hủy")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleSave(
              Number(selectedAmount),
              selectedHour,
              selectedMinute,
             (date.getTime() - 7 * 60 * 60 * 1000).toString(),
              type
            );
          }}
          className="flex-row items-center justify-center w-[45%] bg-cyan-blue py-3 rounded-md shadow-md"
        >
          <Text className="text-xl text-white font-bold ">{t("Sửa")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
