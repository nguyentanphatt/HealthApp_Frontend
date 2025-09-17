import { images } from "@/constants/image";
import { FoodDetail } from "@/constants/type";
import { Href, useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
const FoodDaily = ({title, data}:{title:string, data:FoodDetail[]}) => {
  const router = useRouter()
  const convertData = data.map(
    ({ protein, fiber, fat, starch, ...rest }) => ({
      ...rest,
      nutrition: [
        { label: "Chất đạm", value: `${protein} g` },
        { label: "Chất xơ", value: `${fiber} g` },
        { label: "Chất béo", value: `${fat} g` },
        { label: "Tinh bột", value: `${starch} g` },
      ]
    })
  );
  return (
    <View className="bg-white rounded-md shadow-md flex items-center justify-center w-full h-auto p-4 gap-5">
      <Text className="self-start text-xl font-bold">{title}</Text>
      <FlatList
        data={convertData}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/food/details/${item.recordId}` as Href)}
          >
            <View className="w-[340px] items-center justify-center pr-4 flex gap-4">
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : images.food01}
                width={300}
                height={300}
                className="w-[300px] h-[250px] rounded-lg"
              />
              <Text className="text-2xl text-center font-bold">
                {item.name}
              </Text>
              <View className="flex gap-3 w-full">
                {item.nutrition.map((nutri: any, idx: number) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between"
                  >
                    <Text>{nutri.label}</Text>
                    <View className="border border-dashed border-black flex-1 mx-2" />
                    <Text>{nutri.value}</Text>
                  </View>
                ))}
                <View className="self-end w-[160px]">
                  <View className="border border-black w-full" />
                  <View className="flex-row items-center justify-between gap-2 mt-2">
                    <Text className="text-black text-xl text-right">Tổng:</Text>
                    <Text className="text-black text-2xl font-bold text-right">
                      {item.calories} Kcal
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default FoodDaily;
