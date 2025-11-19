import { useAppTheme } from "@/context/appThemeContext";
import { useModalStore } from "@/stores/useModalStore";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

const Page = () => {
  const router = useRouter();
  const { theme, toggle } = useAppTheme();
  const isEnabled = theme.mode === "dark";
  const [privacyEnabled, setPrivacyEnabled] = useState(false);
  const { openModal } = useModalStore();
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
      id: 1,
      settingName: t("Thông tin bảo mật"),
      isSwitch: false,
    },
    {
      id: 2,
      settingName: t("Quyền"),
      isSwitch: false,
      href: '/user/setting/policy'
    },
    {
      id: 3,
      settingName: t("Cập nhật thông tin cá nhân"),
      isSwitch: false,
      href: '/user/setting/info'
    },
    {
      id: 4,
      settingName: t("Thay đổi mật khẩu"),
      isSwitch: false,
      href: '/user/setting/changepassword'
    },
    {
      id: 5,
      settingName: t("Đăng xuất"),
      isSwitch: false,
      href: '/user/setting/delete'
    }
  ];

  const handlePress = async (id: number, href?: string) => {
    if (id === 5) {
      openModal("confirm", {
        title: t("đăng xuất"),
        onConfirm: () => {
          AsyncStorage.clear();
          AsyncStorage.setItem("hasSeenIntroduction", "true");
          router.push("/auth/signin" as Href);
        },
      });
    }
    else if (id === 1) {
      let url = 'https://www.freeprivacypolicy.com/live/0110d8b7-8fa1-4c5d-a461-3080383b11d8'
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Không thể mở đường dẫn: ", url);

      }
    }
    else {
      router.push(href as Href);
    }
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
              <TouchableOpacity onPress={() => handlePress(item.id, item.href)} className="flex-row items-center justify-between h-[30px]">
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
