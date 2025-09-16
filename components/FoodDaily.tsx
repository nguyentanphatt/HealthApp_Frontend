import React from "react";
import { FlatList, Image, Text, View } from "react-native";

const FoodDaily = ({title, data}:{title:string, data:any}) => {
  return (
    <View className="bg-white rounded-md shadow-md flex items-center justify-center w-full h-auto p-4 gap-5">
      <Text className="self-start text-xl font-bold">{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="w-[340px] items-center justify-center pr-4">
            <Image
              source={item.image}
              width={300}
              height={300}
              className="w-[300px] h-[250px] rounded-lg"
            />
            <Text className="text-2xl text-center font-bold">{item.name}</Text>
            <View className="flex gap-3 w-full">
              {item.nutrition.map((nutri:any, idx:number) => (
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
                    {item.total}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FoodDaily;
