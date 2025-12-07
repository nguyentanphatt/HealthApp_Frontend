import { useAppTheme } from "@/context/appThemeContext";
import { FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

const Page = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    await Promise.all([
      checkNotificationPermission(),
      checkLocationPermission(),
      checkCameraPermission(),
      checkMicrophonePermission(),
    ]);
  };

  const checkNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationEnabled(status === "granted");
    } catch (error) {
      console.error("Error checking notification permission:", error);
    }
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationEnabled(status === "granted");
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const checkCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      setCameraEnabled(status === "granted");
    } catch (error) {
      console.error("Error checking camera permission:", error);
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      if (Platform.OS === "android") {
        const { PermissionsAndroid } = require("react-native");
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        setMicrophoneEnabled(granted);
      } else {
        setMicrophoneEnabled(false);
      }
    } catch (error) {
      console.error("Error checking microphone permission:", error);
      setMicrophoneEnabled(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationEnabled(status === "granted");
        if (status !== "granted") {
          Alert.alert(
            t("Quyền thông báo"),
            t("Vui lòng bật quyền thông báo trong cài đặt"),
            [
              { text: t("Hủy"), style: "cancel" },
              {
                text: t("Mở cài đặt"),
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    } else {
      Alert.alert(
        t("Tắt quyền thông báo"),
        t("Bạn cần tắt quyền thông báo trong cài đặt thiết bị"),
        [
          { text: t("Hủy"), style: "cancel" },
          {
            text: t("Mở cài đặt"),
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationEnabled(status === "granted");
        if (status !== "granted") {
          Alert.alert(
            t("Quyền định vị"),
            t("Vui lòng bật quyền định vị trong cài đặt"),
            [
              { text: t("Hủy"), style: "cancel" },
              {
                text: t("Mở cài đặt"),
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error requesting location permission:", error);
      }
    } else {
      Alert.alert(
        t("Tắt quyền định vị"),
        t("Bạn cần tắt quyền định vị trong cài đặt thiết bị"),
        [
          { text: t("Hủy"), style: "cancel" },
          {
            text: t("Mở cài đặt"),
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const handleCameraToggle = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        setCameraEnabled(status === "granted");
        if (status !== "granted") {
          Alert.alert(
            t("Quyền chụp ảnh"),
            t("Vui lòng bật quyền chụp ảnh trong cài đặt"),
            [
              { text: t("Hủy"), style: "cancel" },
              {
                text: t("Mở cài đặt"),
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error requesting camera permission:", error);
      }
    } else {
      Alert.alert(
        t("Tắt quyền chụp ảnh"),
        t("Bạn cần tắt quyền chụp ảnh trong cài đặt thiết bị"),
        [
          { text: t("Hủy"), style: "cancel" },
          {
            text: t("Mở cài đặt"),
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const handleMicrophoneToggle = async (value: boolean) => {
    if (value) {
      try {
        if (Platform.OS === "android") {
          const { PermissionsAndroid } = require("react-native");
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: t("Quyền ghi âm"),
              message: t("Ứng dụng cần quyền ghi âm để hoạt động"),
              buttonNeutral: t("Để sau"),
              buttonNegative: t("Hủy"),
              buttonPositive: t("Cho phép"),
            }
          );
          setMicrophoneEnabled(granted === PermissionsAndroid.RESULTS.GRANTED);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              t("Quyền ghi âm"),
              t("Vui lòng bật quyền ghi âm trong cài đặt"),
              [
                { text: t("Hủy"), style: "cancel" },
                {
                  text: t("Mở cài đặt"),
                  onPress: () => Linking.openSettings(),
                },
              ]
            );
          }
        } else {
          Alert.alert(
            t("Quyền ghi âm"),
            t("Vui lòng bật quyền ghi âm trong cài đặt"),
            [
              { text: t("Hủy"), style: "cancel" },
              {
                text: t("Mở cài đặt"),
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error requesting microphone permission:", error);
      }
    } else {
      Alert.alert(
        t("Tắt quyền ghi âm"),
        t("Bạn cần tắt quyền ghi âm trong cài đặt thiết bị"),
        [
          { text: t("Hủy"), style: "cancel" },
          {
            text: t("Mở cài đặt"),
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const policyData = [
    {
      id: 1,
      settingName: t("Quyền thông báo"),
      isSwitch: true,
      enabled: notificationEnabled,
      onToggle: handleNotificationToggle,
    },
    {
      id: 2,
      settingName: t("Quyền định vị"),
      isSwitch: true,
      enabled: locationEnabled,
      onToggle: handleLocationToggle,
    },
    {
      id: 3,
      settingName: t("Quyền chụp ảnh"),
      isSwitch: true,
      enabled: cameraEnabled,
      onToggle: handleCameraToggle,
    },
    {
      id: 4,
      settingName: t("Quyền ghi âm"),
      isSwitch: true,
      enabled: microphoneEnabled,
      onToggle: handleMicrophoneToggle,
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
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold self-center" style={{ color: theme.colors.textPrimary }}>
            {t("Quyền")}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      <View className="flex gap-4 py-8">
        <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>
          {t("Quyền ứng dụng")}
        </Text>
        <View className="flex w-full gap-4 rounded-md shadow-md p-4" style={{ backgroundColor: theme.colors.card }}>
          {policyData.map((item, idx) => (
            <View key={item.id} className="flex gap-4">
              <TouchableOpacity className="flex-row items-center justify-between h-[30px]">
                <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>
                  {item.settingName}
                </Text>
                {item.isSwitch && (
                  <Switch
                    value={item.enabled}
                    onValueChange={item.onToggle}
                    trackColor={{ false: "#00000066", true: theme.colors.tint }}
                    thumbColor={item.enabled ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    className="scale-125"
                  />
                )}
              </TouchableOpacity>
              {idx === policyData.length - 1 ? null : (
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

