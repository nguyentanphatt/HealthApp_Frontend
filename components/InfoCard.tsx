import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const InfoCard = ({ title, content, subcontent, icon }: { title: string; content: string, subcontent?:string, icon?:string }) => {
  return (
    <View className="flex flex-row items-center justify-between bg-white p-2 rounded-md shadow-md mb-1">
      <View>
      <Text className="text-xl">{title}</Text>
      <Text className="text-2xl font-bold">{content}<Text className="text-xl font-normal">{subcontent}</Text></Text>
      </View>
      {icon && <FontAwesome6 name={icon} size={30} color="#19B1FF" />}
    </View>
  );
};

export default InfoCard;
