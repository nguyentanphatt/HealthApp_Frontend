import InputWithIcon from "@/components/InputWithIcon";
import { images } from "@/constants/image";
import i18n from "@/plugins/i18n";
import { googleSigninAPI, sendOtp, signup } from "@/services/user";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToastStore } from "@/stores/useToast";
import { validateConfirmPassword, validateEmail, validatePassword } from "@/utils/validate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
const Signup = () => {
  const router = useRouter()
  const setTokens = useAuthStore(state => state.setTokens)
  const { addToast } = useToastStore();
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
    if(email === "" || password === "" || confirmPassword === "") {
      addToast(t("Vui lòng điền đầy đủ thông tin"), "error");
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
      console.log("error");
      addToast(response.message, "error");
    }
  };

  //Comment this when testing on local expo go
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  },[])

  const googleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const {idToken, user} = response.data
        const {name, email, photo} = user
        console.log("name", name);
        console.log("email", email);
        console.log("photo", photo);
        const res = await googleSigninAPI(name || "", email || "", photo || "");
        if (res.success) {
          addToast(res.message, "success");
          setTokens(res.data.accessToken, res.data.refreshToken)
          router.push("/(tabs)");
        } else {
          addToast(res.message, "error");
        }
      } else {
        addToast(t("Đăng nhập thất bại"), "error");
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            addToast(t("Đang xử lý..."), "error");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            addToast(t("Play services không khả dụng"), "error");
            break;
          default:
            addToast(t("Đã xảy ra lỗi"), "error");
        }
      } else {
        addToast(t("Đã xảy ra lỗi"), "error");
      }
    }
  };
  //


  return (
    <View className="font-lato-regular flex-1 items-center py-10 h-full">
      <Text className="text-2xl font-bold text-center py-16">{t("Đăng ký")}</Text>
      <Image
        source={images.star}
        className="-z-10 absolute top-1/5 -right-[10%] w-[100px] h-[100px]"
      />
      <Image
        source={images.star}
        className="-z-10 absolute top-[100px] -left-[15%] w-[100px] h-[100px]"
      />
      <View className="flex-1 items-center justify-start w-full gap-10 z-10 bg-white/40 backdrop-blur-md px-5">
        <InputWithIcon
          icon="envelope"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
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
          <View className="w-[100px] h-0.5 bg-gray-400" />
          <Text>{t("hoặc")}</Text>
          <View className="w-[100px] h-0.5 bg-gray-400" />
        </View>
        <TouchableOpacity className="flex items-center justify-center p-4 rounded-md bg-white shadow-sm" onPress={googleSignin}>
          <Image source={images.googleicon} className="size-[25px]" />
        </TouchableOpacity>
        <View className="flex items-center gap-2">
          <Text className="text-black/50">
            {t("Đã có tài khoản ?")}{" "}
            <Link href={"/auth/signin"} className="text-cyan-blue">
              {t("Đăng nhập")}
            </Link>
          </Text>
          <Text className="text-black/50">{t("Duy trì trạng thái đăng xuất")}</Text>
        </View>
      </View>
    </View>
  );
};

export default Signup;