// ReminderCard.tsx
import { useAppTheme } from "@/context/appThemeContext";
import { useUnits } from "@/hooks/useUnits";
import { updateWaterReminder } from "@/services/water";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

const ReminderCard = ({ amount, time, id, enabled }: { amount: string; time: number; id: string; enabled: boolean }) => {
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const {displayWater} = useUnits()
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  const timestamp = convertISOToTimestamp(time.toString());
  const hour = String(new Date(timestamp).getHours()).padStart(2, "0");
  const minute = String(new Date(timestamp).getMinutes()).padStart(2, "0");
  const handleCheckboxChange = async (checked: boolean) => {
    setIsChecked(checked);
    const response = await updateWaterReminder(id, amount, timestamp.toString(), !checked);
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ["waterReminder"] });
    }
  };
  return (
    <View className="relative">
      <View className="flex gap-1 p-4 rounded-md shadow-md" style={{ backgroundColor: theme.colors.card }}>
        <View className="flex flex-row items-center justify-between">
          <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{t("Nhắc nhở")}</Text>
          <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{hour} : {minute}</Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text
            className={`text-2xl font-bold ${isChecked || enabled === false ? "text-gray-400 line-through" : "text-black"
              }`}
            style={{ color: theme.colors.textPrimary }}
          >
            {displayWater(Number(amount)).formatted}
          </Text>
          <Checkbox
            value={isChecked || enabled === false}
            onValueChange={handleCheckboxChange}
            color={isChecked || enabled === false ? "#19B1FF" : undefined}
          />
        </View>
      </View>

      {enabled === false && (
        <View className="absolute flex items-center justify-center inset-0 rounded-md" style={{ backgroundColor: theme.mode === "dark" ? "bg-white/50" : "bg-white/60" }}>
          <View className="bg-cyan-blue/60 rounded-full flex items-center justify-center size-10">
            <FontAwesome6 name="check" size={24} color={theme.colors.textPrimary} />
          </View>
        </View>
      )}
    </View>
  );
};

export default ReminderCard;
