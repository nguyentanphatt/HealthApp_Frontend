import InputWithIcon from "@/components/InputWithIcon";
import { images } from "@/constants/image";
import { useAppTheme } from "@/context/appThemeContext";
import i18n from "@/plugins/i18n";
import { sendOtp, signup } from "@/services/user";
import { validateConfirmPassword, validateEmail, validatePassword } from "@/utils/validate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Signup = () => {
  const router = useRouter()
  const { theme } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { t } = useTranslation();

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem('temp_language');
        if (stored === 'en' || stored === 'vi') {
          await i18n.changeLanguage(stored);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  const handleSignup = async() => {
    if (
      errorMessage.email ||
      errorMessage.password ||
      errorMessage.confirmPassword
    ) {
      return;
    }
    const response = await signup(email, password);
    if(response.success){
      await AsyncStorage.multiSet([
        ["email", email],
        ["type", "signup"]
      ]);
      await sendOtp(email)
      router.push('/auth/verify')
    }
    else {
      console.log(response.message);
    }
  };
  const googleSignin = () => {
    //Signin with google
    //Return data to storage in database
  };

  const localData = () => {
    //Setup an AsyncStorage to store data
  };

  return (
    <View className="font-lato-regular flex-1 items-center py-10 h-full" style={{ backgroundColor: theme.colors.background }}>
      <Text className="text-2xl font-bold text-center py-20" style={{ color: theme.colors.textPrimary }}>{t("Đăng ký")}</Text>
      <Image
        source={images.star}
        className="-z-10 absolute top-1/5 -right-[10%] w-[100px] h-[100px]"
      />
      <Image
        source={images.star}
        className="-z-10 absolute top-[20%] -left-[15%] w-[100px] h-[100px]"
      />
      <View className="flex-1 items-center justify-center w-full gap-[6%] z-10 px-5" style={{ backgroundColor: theme.mode === "dark" ? theme.colors.card : "white/40 backdrop-blur-md" }}>
        <InputWithIcon
          icon="envelope"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={{ color: theme.colors.textPrimary }}
          placeholderTextColor={theme.colors.textSecondary}
          onBlur={() => {
            const emailError = validateEmail(email);
            setErrorMessage((prev) => ({ ...prev, email: t(emailError) }));
          }}
          error={errorMessage.email}
        />

        <InputWithIcon
          icon="key"
          placeholder={t("Mật khẩu")}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ color: theme.colors.textPrimary }}
          placeholderTextColor={theme.colors.textSecondary}
          onBlur={() => {
            const passwordError = validatePassword(password);
            setErrorMessage((prev) => ({ ...prev, password: t(passwordError) }));
          }}
          error={errorMessage.password}
        />
        <InputWithIcon
          icon="key"
          placeholder={t("Xác nhận mật khẩu")}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={{ color: theme.colors.textPrimary }}
          placeholderTextColor={theme.colors.textSecondary}
          onBlur={() => {
            const confirmPasswordError = validateConfirmPassword(
              password,
              confirmPassword
            );
            setErrorMessage((prev) => ({
              ...prev,
              confirmPassword: t(confirmPasswordError),
            }));
          }}
          error={errorMessage.confirmPassword}
        />
        <TouchableOpacity
          className="flex items-center justify-center py-4 w-full bg-cyan-blue rounded-full"
          onPress={handleSignup}
        >
          <Text className="text-white">{t("Đăng ký")}</Text>
        </TouchableOpacity>
        <View className="flex flex-row items-center justify-center gap-1">
          <View className="w-[100px] h-0.5" style={{ backgroundColor: theme.colors.border }} />
          <Text>{t("hoặc")}</Text>
          <View className="w-[100px] h-0.5" style={{ backgroundColor: theme.colors.border }} />
        </View>
        <TouchableOpacity className="flex items-center justify-center p-4 rounded-md" style={{ backgroundColor: theme.mode === "dark" ? theme.colors.card : "white/40 backdrop-blur-md" }}>
          <Image source={images.googleicon} className="size-[25px]" />
        </TouchableOpacity>
        <View className="flex items-center gap-2">
          <Text className="" style={{ color: theme.colors.textSecondary }}>
            {t("Đã có tài khoản ?")}{" "}
            <Link href={"/auth/signin"} className="text-cyan-blue">
              {t("Đăng nhập")}
            </Link>
          </Text>
          <Text className="" style={{ color: theme.colors.textSecondary }}>{t("Duy trì trạng thái đăng xuất")}</Text>
        </View>
      </View>
    </View>
  );
};

export default Signup;
