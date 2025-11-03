import React from "react";
import { View } from "react-native";

const ProgressBar = ({ color, value }: { color: string, value: number }) => {
  return (
    <View className="relative w-56 h-7">
      <View
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: `${color}33` }}
      />
      <View
        className="size-7 rounded-full"
        style={{backgroundColor: color, width: `${value}%` }}
      />  
    </View>
  );
};

export default ProgressBar;
