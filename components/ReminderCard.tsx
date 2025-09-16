// ReminderCard.tsx
import { updateWaterReminder } from "@/services/water";
import { convertISOToTimestamp } from "@/utils/convertISOtoTimestamp";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import React, { useState } from "react";
import { Text, View } from "react-native";

const ReminderCard = ({ amount, time, id, enabled }: { amount: string; time: number; id: string; enabled: boolean }) => {
  const queryClient = useQueryClient();
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
      <View className="flex gap-1 p-4 rounded-md bg-white shadow-md">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-xl">Nhắc nhở</Text>
          <Text className="text-xl">{hour} : {minute}</Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text
            className={`text-2xl font-bold ${isChecked ? "text-gray-400 line-through" : "text-black"
              }`}
          >
            {amount} ml
          </Text>
          <Checkbox
            value={isChecked}
            onValueChange={handleCheckboxChange}
            color={isChecked ? "#19B1FF" : undefined}
          />
        </View>
      </View>

      {enabled === false && (
        <View className="absolute flex items-center justify-center inset-0 bg-white/60 rounded-md">
          <View className="bg-cyan-blue/60 rounded-full flex items-center justify-center size-10">
            <FontAwesome6 name="check" size={24} color="white" />
          </View>
        </View>
      )}
    </View>
  );
};

export default ReminderCard;
