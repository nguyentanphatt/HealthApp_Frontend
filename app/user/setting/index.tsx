import { useAppTheme } from "@/context/appThemeContext";
import { FontAwesome6 } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

const Page = () => {
  const router = useRouter();
  const { theme, toggle } = useAppTheme();
  const isEnabled = theme.mode === "dark";
  const [privacyEnabled, setPrivacyEnabled] = useState(false);
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
      className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular"
      style={{ backgroundColor: theme.colors.background }}
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex pt-16" style={{ backgroundColor: theme.colors.background }}>
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as Href)}
          >
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold self-center" style={{ color: theme.colors.textPrimary }}>{t("Cài đặt")}</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <View className="flex gap-4 py-8">
        <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>{t("Chung")}</Text>
        <View className="flex w-full gap-4 rounded-md shadow-md p-4" style={{ backgroundColor: theme.colors.card }}>
          {overallData.map((item, idx) => (
            <View key={idx} className="flex gap-4">
              <TouchableOpacity
                className="flex-row items-center justify-between h-[30px]"
                onPress={() => item.href && router.push(item.href as Href)}
              >
                <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{item.settingName}</Text>
                {item.isSwitch && (
                  <Switch
                    value={isEnabled}
                    onValueChange={async () => { await toggle(); }}
                    trackColor={{ false: "#00000066", true: theme.colors.tint }}
                    thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    className="scale-125"
                  />
                )}
              </TouchableOpacity>
              {idx === overallData.length - 1 ? null : (
                <View className="w-full h-0.5" style={{ backgroundColor: theme.colors.border }} />
              )}
            </View>
          ))}
        </View>

        <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>{t("Riêng tư")}</Text>
        <View className="flex w-full gap-4 rounded-md shadow-md p-4" style={{ backgroundColor: theme.colors.card }}>
          {privateData.map((item, idx) => (
            <View key={idx} className="flex gap-4">
              <TouchableOpacity onPress={() => router.push(item.href as Href)} className="flex-row items-center justify-between h-[30px]">
                <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{item.settingName}</Text>
                {item.isSwitch && (
                  <Switch
                    value={privacyEnabled}
                    onValueChange={setPrivacyEnabled}
                    trackColor={{ false: "#00000066", true: "#19B1FF" }}
                    thumbColor={privacyEnabled ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    className="scale-125"
                  />
                )}
              </TouchableOpacity>
              {idx === privateData.length - 1 ? null : (
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
