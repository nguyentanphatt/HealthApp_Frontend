import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type TabIconProps = {
  focused: boolean;
  name: keyof typeof FontAwesome6.glyphMap;
  tabName: string;
};

export default function TabIcon({ focused, name, tabName }: TabIconProps) {
  return (
    <View className="w-[100px] flex items-center justify-center">
      <FontAwesome6
        name={name}
        size={20}
        color={focused ? "#19B1FF" : "black"}
      />
      <Text
        style={{
          fontSize: 12,
          color: focused ? "#19B1FF" : "black",
          marginTop: 2,
        }}
      >
        {tabName}
      </Text>
    </View>
  );
}
