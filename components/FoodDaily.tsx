import { images } from "@/constants/image";
import { FoodDetail } from "@/constants/type";
import { useAppTheme } from "@/context/appThemeContext";
import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
const FoodDaily = ({title, data, selectedDate}:{title:string, data:FoodDetail[], selectedDate:number}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter()
  const convertData = data.map(
    ({ protein, fiber, fat, starch, ...rest }) => ({
      ...rest,
      nutrition: [
        { label: t("Chất đạm"), value: `${protein} g` },
        { label: t("Chất xơ"), value: `${fiber} g` },
        { label: t("Chất béo"), value: `${fat} g` },
        { label: t("Tinh bột"), value: `${starch} g` },
      ]
    })  
  );
  const convertTitle = t(title);
  return (
    <View className="rounded-md shadow-md flex items-center justify-center w-full h-auto p-4 gap-5" style={{ backgroundColor: theme.colors.card }}>
      <Text className="self-start text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{convertTitle}</Text>
      <FlatList
        data={convertData}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/food/details/${item.recordId}?selectedDate=${selectedDate}` as Href)}
          >
            <View className="w-[360px] items-center justify-center pr-4 flex gap-4">
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : images.food01}
                width={300}
                height={300}
                className="w-[300px] h-[250px] rounded-lg"
              />
              <Text className="text-2xl text-center font-bold" style={{ color: theme.colors.textPrimary }}>
                {item.name}
              </Text>
              <View className="flex gap-3 w-full">
                {item.nutrition.map((nutri: any, idx: number) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between"
                  >
                    <Text style={{ color: theme.colors.textPrimary }}>{nutri.label}</Text>
                    <View className="border border-dashed border-black flex-1 mx-2" style={{ borderColor: theme.colors.border }} />
                    <Text style={{ color: theme.colors.textPrimary }}>{nutri.value}</Text>
                  </View>
                ))}
                <View className="self-end w-[160px]">
                  <View className="border border-black w-full" style={{ borderColor: theme.colors.border }} />
                  <View className="flex-row items-center gap-2 mt-2">
                    <Text className="text-xl text-right" style={{ color: theme.colors.textPrimary }}>{t("Tổng")}:</Text>
                    <Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
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
