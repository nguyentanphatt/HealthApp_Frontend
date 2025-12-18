import InputWithIcon from "@/components/InputWithIcon";
import { useAppTheme } from "@/context/appThemeContext";
import i18n from "@/plugins/i18n";
import { changePassword } from "@/services/user";
import { useToastStore } from "@/stores/useToast";
import { useUserStore } from "@/stores/useUserStore";
import {
  validateConfirmPassword,
  validatePassword,
} from "@/utils/validate";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

const Page = () => {
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const { theme } = useAppTheme();
  const { addToast } = useToastStore();
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem("temp_language");
        if (storedLang === "en" || storedLang === "vi") {
          await i18n.changeLanguage(storedLang);
        }
      } catch (error) {
        console.error("Error loading language:", error);
      }
    };
    loadLanguage();
  }, []);

  const { mutate: handleChangePassword, isPending } = useMutation({
    mutationFn: async () =>
      changePassword({
        email: user?.email || "",
        newPassword,
      }),
    onSuccess: () => {
      addToast(t("Đổi mật khẩu thành công"), "success");
      AsyncStorage.clear();
      AsyncStorage.setItem("hasSeenIntroduction", "true");
      router.push("/auth/signin" as Href);
    },
    onError: () => {
      addToast(t("Đổi mật khẩu thất bại"), "error");
    },
  });

  const onSubmit = () => {
    if (
      !user?.email ||
      !newPassword ||
      !confirmPassword ||
      errorMessage.newPassword ||
      errorMessage.confirmPassword
    ) {
      addToast(t("Vui lòng điền đầy đủ thông tin"), "error");
      return;
    }
    console.log(user?.email, newPassword, confirmPassword, errorMessage.newPassword, errorMessage.confirmPassword);
    
    handleChangePassword();

  };

  return (
    <View className="flex-1 bg-white pt-16 gap-6" style={{ backgroundColor: theme.colors.background }}>
      <View className='flex flex-row items-center justify-between w-full'>
        <TouchableOpacity onPress={() => router.back()} className='size-14 rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.background }}>
          <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Thay đổi mật khẩu")}</Text>
        <View className='size-14 rounded-full' style={{ backgroundColor: theme.mode === "dark" ? theme.colors.card : theme.colors.background }} />
      </View>

      <View className="gap-7 mt-10 px-5">
        <InputWithIcon
          icon="envelope"
          placeholder={t("Email")}
          value={user?.email || ""}
          editable={false}
        />

        <InputWithIcon
          icon="lock"
          placeholder={t("Mật khẩu mới")}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          onBlur={() => {
            const error = validatePassword(newPassword);
            setErrorMessage((prev) => ({
              ...prev,
              newPassword: error ? t(error) : "",
            }));
          }}
          error={errorMessage.newPassword}
        />

        <InputWithIcon
          icon="lock"
          placeholder={t("Xác nhận mật khẩu mới")}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onBlur={() => {
            const error = validateConfirmPassword(
              newPassword,
              confirmPassword
            );
            setErrorMessage((prev) => ({
              ...prev,
              confirmPassword: error ? t(error) : "",
            }));
          }}
          error={errorMessage.confirmPassword}
        />
      </View>

      <TouchableOpacity
        activeOpacity={1}
        className="bg-cyan-blue rounded-full py-4 items-center mt-auto mx-5"
        onPress={onSubmit}
        disabled={isPending}
      >
        <Text className="text-white font-semibold">
          {isPending ? t("Đang xử lý...") : t("Lưu thay đổi")}
        </Text>
      </TouchableOpacity>
      <View className="h-[40px]"/>
    </View>
  );
};

export default Page;
