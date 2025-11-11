import { images } from "@/constants/image";
import { useAppTheme } from "@/context/appThemeContext";
import i18n from "@/plugins/i18n";
import { sendOtp, verifyOtp } from "@/services/user";
import { useAuthStore } from "@/stores/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
const Verify = () => {
  const router = useRouter()
  const { theme } = useAppTheme();
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const setTokens = useAuthStore(state => state.setTokens)
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

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds:number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    const loadEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("email");
      const type = await AsyncStorage.getItem("type");
      if (storedEmail && type) {
        setEmail(storedEmail);
        setType(type);
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("type");
        sendOtp(storedEmail);
      }
    };
    loadEmail();
  }, []);

  const handleVerify = async(otp:string) => {
    try {
     const response = await verifyOtp(email, otp);
     if(response.success){
      setTokens(response.data.accessToken, response.data.refreshToken)
      if(type === 'signup'){
        console.log("Đăng ký thành công");
        router.push("/(tabs)");
      } else {
        console.log("Đăng nhập thành công");
        router.push("/(tabs)");
      }

     } 
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.log(err.response?.data.message);
    }
  }

  const resend = async () => {
    try {
      await sendOtp(email)
      console.log("Đã gửi lại mã OTP");
    } catch (error) {
      throw error
    }
  }

  return (
    <View className="font-lato-regular flex-1 items-center py-10 h-full" style={{ backgroundColor: theme.colors.background }}>
      <View className="py-20">
        <Text className="text-2xl font-bold text-center" style={{ color: theme.colors.textPrimary }}>{t("Xác thực OTP")}</Text>
        <Text className="text-center" style={{ color: theme.colors.textSecondary }}>
          {t("Chúng tôi đã gửi OTP qua mail của bạn")}
        </Text>
      </View>
      <Image
        source={images.star}
        className="-z-10 absolute top-1/5 -right-[10%] w-[100px] h-[100px]"
      />
      <Image
        source={images.star}
        className="-z-10 absolute top-[20%] -left-[15%] w-[100px] h-[100px]"
      />
      <View className="flex-1 items-center w-full gap-[5%] z-10 px-5" style={{ backgroundColor: theme.mode === "dark" ? theme.colors.card : "white/40 backdrop-blur-md" }}>
        <View className="w-full flex items-center pt-10">
          <OtpInput
            numberOfDigits={6}
            focusColor="#19B1FF"
            onTextChange={(text) => setOtp(text)}
            textInputProps={{
              keyboardType: "numeric",
              style: {
                color: theme.colors.textPrimary,
              },
            }}
            theme={{
              containerStyle: {
                width: "90%",
              },
              pinCodeContainerStyle: {
                backgroundColor: theme.mode === "dark" ? theme.colors.card : "white",
                borderRadius: 4,
                borderColor: theme.colors.border,
              },
              pinCodeTextStyle: {
                color: theme.colors.textPrimary,
                fontSize: 20,
              },
            }}
          />
          <Text className="self-end mt-2 px-5" style={{ color: theme.colors.textSecondary }}>{formatTime(timeLeft)}</Text>
        </View>
        <TouchableOpacity onPress={resend}>
          <Text className="text-cyan-blue text-center" >
            {t("Gửi lại OTP")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center justify-center py-4 w-full bg-cyan-blue rounded-full"
          onPress={() => handleVerify(otp)}
        >
          <Text className="text-white">{t("Xác thực")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Verify;
