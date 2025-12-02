import React from "react";
import { View } from "react-native";

const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(num, max));

const ProgressBar = ({ color, value, max }: { color: string, value: number, max: number }) => {
  const safeMax = max > 0 ? max : 1;
  const percentage = clamp((value / safeMax) * 100, 0, 100);
  return (
    <View className="relative w-56 h-7">
      <View
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: `${color}33` }}
      />
      <View
        className="h-7 rounded-full"
        style={{ backgroundColor: color, width: `${percentage}%` }}
      />
    </View>
  );
};

export default ProgressBar;
