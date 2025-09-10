import React from "react";
import { Text, View } from "react-native";

const InfoCard = ({ title, content, subcontent }: { title: string; content: string, subcontent?:string }) => {
  return (
    <View className="bg-white p-2 rounded-md shadow-md mb-1">
      <Text className="text-xl">{title}</Text>
      <Text className="text-2xl font-bold">{content}<Text className="text-xl font-normal">{subcontent}</Text></Text>
    </View>
  );
};

export default InfoCard;
