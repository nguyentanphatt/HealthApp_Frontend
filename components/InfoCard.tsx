import { useAppTheme } from "@/context/appThemeContext";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const InfoCard = ({ title, content, subcontent, icon }: { title: string; content: string, subcontent?:string, icon?:string }) => {
  const { theme } = useAppTheme();
  return (
    <View className="flex flex-row items-center justify-between p-2 rounded-md shadow-md mb-1" style={{ backgroundColor: theme.colors.card }}>
      <View>
      <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{title}</Text>
      <Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{content}<Text className="text-xl font-normal" style={{ color: theme.colors.textPrimary }}>{subcontent}</Text></Text>
      </View>
      {icon && <FontAwesome6 name={icon} size={30} color={theme.colors.textPrimary} />}
    </View>
  );
};

export default InfoCard;
