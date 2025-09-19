import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

const Page = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("vi");
  const options: Option[] = [
    { label: "Tiếng Việt", value: "vi" },
    { label: "Tiếng Anh", value: "en" },
  ];

  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex bg-[#f6f6f6] pt-16">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center">Ngôn ngữ</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <View className="flex gap-4 py-8">
        <View className="flex w-full gap-4 bg-white rounded-md shadow-md p-4">
          {options.map((item, idx) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setSelected(item.value)}
              className="flex gap-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xl text-black">{item.label}</Text>
                <View className="size-[20px] rounded-full border-2 border-black flex items-center justify-center">
                  {selected === item.value && (
                    <View className="size-[10px] rounded-full bg-black" />
                  )}
                </View>
              </View>

              {idx === options.length - 1 ? null : (
                <View className="w-full h-0.5 bg-black/40" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Page;
