import { useUnits } from "@/context/unitContext";
import i18n from "@/plugins/i18n";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

const Page = () => {
  const router = useRouter();
  const { units, setUnit, isLoaded } = useUnits();
  const { t } = useTranslation();
  const options: Option[] = [
    { label: t("Tiếng Việt"), value: "vi" },
    { label: t("Tiếng Anh"), value: "en" },
  ];

  useEffect(() => {
    if (isLoaded) {
      // Update i18n language when units are loaded
      i18n.changeLanguage(units.language);
    }
  }, [units.language, isLoaded]);

  const onSelect = async (lang: "vi" | "en") => {
    setUnit("language", lang);
    await i18n.changeLanguage(lang);
  };

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
          <Text className="text-2xl font-bold  self-center">{t("Ngôn ngữ")}</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <View className="flex gap-4 py-8">
        <View className="flex w-full gap-4 bg-white rounded-md shadow-md p-4">
          {options.map((item, idx) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => onSelect(item.value as "vi" | "en")}
              className="flex gap-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xl text-black">{item.label}</Text>
                <View className="size-[20px] rounded-full border-2 border-black flex items-center justify-center">
                  {units.language === item.value && (
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
