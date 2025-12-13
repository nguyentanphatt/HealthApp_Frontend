import { useAppTheme } from "@/context/appThemeContext";
import { useUnits } from "@/context/unitContext";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
const Page = () => {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { units, setUnit, isLoaded } = useUnits();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const measureData = [
    { key: "height", label: "Chiều cao", options: ["cm", "ft"] },
    { key: "weight", label: "Cân nặng", options: ["kg", "g"] },
    { key: "water", label: "Lượng nước", options: ["ml", "fl oz"] },
    { key: "temperature", label: "Nhiệt độ", options: ["C", "F"] },
  ] as const;

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.textPrimary} />
        <Text className="text-lg text-gray-600 mt-4">Loading</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular"
      style={{ backgroundColor: theme.colors.background }}
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex pt-16" style={{ backgroundColor: theme.colors.background }}>
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Đơn vị đo")}</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <View className="flex gap-4 py-8">
        <View className="flex w-full gap-4 rounded-md shadow-md p-4" style={{ backgroundColor: theme.colors.secondaryCard }}>
          {measureData.map((item, idx) => (
            <View key={item.key} className="flex gap-4 relative">
              <TouchableOpacity
                className="flex-row items-center justify-between w-full relative"
                onPress={() =>
                  setOpenDropdown(openDropdown === item.key ? null : item.key)
                }
              >
                <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{t(item.label)}</Text>
                <View>
                  <Text className="text-xl text-cyan-blue">
                    {units[item.key]}
                  </Text>
                </View>
              </TouchableOpacity>

              {openDropdown === item.key && (
                <View
                  className="absolute top-8 right-0 rounded-md shadow-lg z-50 w-[50px] flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.secondaryCard, elevation: 5 }}
                >
                  {item.options.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setUnit(item.key, opt as any);
                        setOpenDropdown(null);
                      }}
                      className="p-2"
                    >
                      <Text
                        className={`text-xl ${units[item.key] === opt ? "font-semibold" : ""}`}
                        style={{
                          color:
                            units[item.key] === opt
                              ? "#19B1FF"
                              : theme.colors.textPrimary,
                        }}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {idx === measureData.length - 1 ? null : (
                <View className="w-full h-0.5" style={{ backgroundColor: theme.colors.border }} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Page;
