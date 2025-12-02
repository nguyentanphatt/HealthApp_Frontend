// ReminderCard.tsx
import { useAppTheme } from "@/context/appThemeContext";
import { useUnits } from "@/hooks/useUnits";
import { updateWaterReminder } from "@/services/water";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { useQueryClient } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type ReminderCardProps = {
  amount: string;
  time: number;
  id: string;
  enabled: boolean;
  onToggleEnabled?: (id: string, enabled: boolean) => void;
};

const ReminderCard = ({ amount, time, id, enabled, onToggleEnabled }: ReminderCardProps) => {
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const {displayWater} = useUnits()
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(!enabled);
  useEffect(() => {
    setIsChecked(!enabled);
  }, [enabled]);
  const timestamp = convertISOToTimestamp(time.toString());
  const hour = String(new Date(timestamp).getHours()).padStart(2, "0");
  const minute = String(new Date(timestamp).getMinutes()).padStart(2, "0");
  const handleCheckboxChange = async (checked: boolean) => {
    setIsChecked(checked);
    const response = await updateWaterReminder(id, amount, timestamp.toString(), !checked);
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ["waterReminder"] });
      onToggleEnabled?.(id, !checked);
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
            className={`text-2xl font-bold ${isChecked || !enabled ? "text-gray-400 line-through" : "text-black"
              }`}
            style={{ color: theme.colors.textPrimary }}
          >
            {displayWater(Number(amount)).formatted}
          </Text>
          <Checkbox
            value={isChecked || !enabled}
            onValueChange={handleCheckboxChange}
            color={isChecked || !enabled ? "#19B1FF" : undefined}
          />
        </View>
      </View>
    </View>
  );
};

export default ReminderCard;
