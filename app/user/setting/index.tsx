import { FontAwesome6 } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

const Page = () => {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const { t } = useTranslation();
  const overallData = [
    {
      settingName: t("Chế độ tối"),
      isSwitch: true,
    },
    {
      settingName: t("Ngôn ngữ"),
      isSwitch: false,
      href: '/user/setting/language'
    },
    {
      settingName: t("Đơn vị đo"),
      isSwitch: false,
      href: '/user/setting/measure'
    },
  ];

  const privateData = [
    {
      settingName: t("Thông tin vị trí"),
      isSwitch: true,
    },
    {
      settingName: t("Thông tin bảo mật"),
      isSwitch: false,
    },
    {
      settingName: t("Quyền"),
      isSwitch: false,
    },
    {
      settingName: t("Cập nhật thông tin cá nhân"),
      isSwitch: false,
      href: '/user/setting/info'
    },
    {
      settingName: t("Xóa dữ liệu cá nhân"),
      isSwitch: false,
    },
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
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as Href)}
          >
            <FontAwesome6 name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center">{t("Cài đặt")}</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <View className="flex gap-4 py-8">
        <Text className="text-lg text-black/60">{t("Chung")}</Text>
        <View className="flex w-full gap-4 bg-white rounded-md shadow-md p-4">
          {overallData.map((item, idx) => (
            <View key={idx} className="flex gap-4">
              <TouchableOpacity
                className="flex-row items-center justify-between h-[30px]"
                onPress={() => router.push(item.href as Href)}
              >
                <Text className="text-xl">{item.settingName}</Text>
                {item.isSwitch && (
                  <Switch
                    value={isEnabled}
                    onValueChange={setIsEnabled}
                    trackColor={{ false: "#00000066", true: "#19B1FF" }}
                    thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    className="scale-125"
                  />
                )}
              </TouchableOpacity>
              {idx === overallData.length - 1 ? null : (
                <View className="w-full h-0.5 bg-black/40" />
              )}
            </View>
          ))}
        </View>

        <Text className="text-lg text-black/60">{t("Riêng tư")}</Text>
        <View className="flex w-full gap-4 bg-white rounded-md shadow-md p-4">
          {privateData.map((item, idx) => (
            <View key={idx} className="flex gap-4">
              <TouchableOpacity onPress={() => router.push(item.href as Href)} className="flex-row items-center justify-between h-[30px]">
                <Text className="text-xl">{item.settingName}</Text>
                {item.isSwitch && (
                  <Switch
                    value={isEnabled}
                    onValueChange={setIsEnabled}
                    trackColor={{ false: "#00000066", true: "#19B1FF" }}
                    thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    className="scale-125"
                  />
                )}
              </TouchableOpacity>
              {idx === privateData.length - 1 ? null : (
                <View className="w-full h-0.5 bg-black/40" />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Page;
