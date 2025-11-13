import InputWithIcon from "@/components/InputWithIcon";
import { images } from "@/constants/image";
import i18n from "@/plugins/i18n";
import { signin } from "@/services/user";
import { useToastStore } from "@/stores/useToast";
import { validateEmail } from "@/utils/validate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Href, Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Signin = () => {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState({
    email: "",
    password: "",
  });
  const [apiError, setApiError] = useState("");

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


  const signinMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      return await signin(email, password)
    },

    onSuccess: async (Response, variables) => {
      await AsyncStorage.multiSet([
        ["email", variables.email],
        ["type", "signin"],
      ]);
      router.push('/auth/verify')
    },

    onError: (error) => {
      const err = error as AxiosError<{ message: string }>;
      const msg = err.response?.data?.message || t("Đăng nhập thất bại!");
      addToast(msg, "error");
      console.log("err", msg);
    },
  })


  const googleSignin = () => {
    //Signin with google
    //Return data to storage in database
  }

  const localData = () => {
    //Setup an AsyncStorage to store data
  }

  return (
    <View className="font-lato-regular flex-1 items-center py-10 h-full relative">
      <Text className="text-2xl font-bold text-center py-20">{t("Đăng nhập")}</Text>
      <Image
        source={images.star}
        className="-z-10 absolute top-1/5 -right-[10%] w-[100px] h-[100px]"
      />
      <Image
        source={images.star}
        className="-z-10 absolute top-[20%] -left-[15%] w-[100px] h-[100px]"
      />
      <View className="flex-1 items-center justify-center w-full gap-[7%] z-10 bg-white/40 backdrop-blur-md px-5">
        <InputWithIcon
          icon="envelope"
          placeholder={t("Email")}
          value={email}
          onChangeText={setEmail}
          onBlur={() => {
            const emailError = validateEmail(email);
            setErrorMessage((prev) => ({ ...prev, email: t(emailError) }));
          }}
          error={errorMessage.email}
        />

        <View className="w-full">
          <InputWithIcon
            icon="key"
            placeholder={t("Mật khẩu")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => router.push("/auth/forget" as Href)}>
            <Text className="text-sm text-black/50 self-end pt-4">
              {t("Quên mật khẩu ?")}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="flex items-center justify-center py-4 w-full bg-cyan-blue rounded-full"
          onPress={() => {
            setApiError("");
            signinMutation.mutate({ email, password });
          }}
        >
          <Text className="text-white">{t("Đăng nhập")}</Text>
        </TouchableOpacity>
        <View className="flex flex-row items-center justify-center gap-1">
          <View className="w-[100px] h-0.5 bg-gray-400" />
          <Text>or</Text>
          <View className="w-[100px] h-0.5 bg-gray-400" />
        </View>
        <TouchableOpacity className="flex items-center justify-center p-4 rounded-md bg-white shadow-sm">
          <Image source={images.googleicon} className="size-[25px]" />
        </TouchableOpacity>
        <View className="flex items-center gap-2">
          <Text className="text-black/50">
            {t("Không có tài khoản ?")}{" "}
            <Link href={"/auth/signup"} className="text-cyan-blue">
              {t("Đăng ký ngay")}
            </Link>
          </Text>
          <Text className="text-black/50">{t("Duy trì trạng thái đăng xuất")}</Text>
        </View>
      </View>
    </View>
  );
};

export default Signin;