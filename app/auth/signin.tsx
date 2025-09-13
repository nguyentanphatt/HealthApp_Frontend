import InputWithIcon from "@/components/InputWithIcon";
import { images } from "@/constants/image";
import { sendOtp, signin } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async () => {
    try {
      const response = await signin(email, password)
      if(response.success) {
        await AsyncStorage.multiSet([
          ["email", email],
          ["type", "signin"],
        ]);
        await sendOtp(email)
        router.push('/auth/verify')
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.log("err", err);
      console.log("err.response?.data.message", err.response?.data.message);
      alert(err.response?.data.message);
      Toast.show({
        type: "error",
        text1: err.response?.data.message,
      });
    }
  }

  const googleSignin = () => {
    //Signin with google
    //Return data to storage in database
  }

  const localData = () => {
    //Setup an AsyncStorage to store data
  }

  return (
    <View className="font-lato-regular flex-1 items-center py-10 h-full">
      <Text className="text-2xl font-bold text-center py-20">Đăng nhập</Text>
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
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <View className="w-full">
          <InputWithIcon
            icon="key"
            placeholder="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Text className="text-sm text-black/50 self-end">
            Quên mật khẩu ?
          </Text>
        </View>
        <TouchableOpacity
          className="flex items-center justify-center py-4 w-full bg-cyan-blue rounded-full"
          onPress={handleSignin}
        >
          <Text className="text-white">Đăng nhập</Text>
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
            Không có tài khoản ?{" "}
            <Link href={"/auth/signup"} className="text-cyan-blue">
              Đăng ký ngay
            </Link>
          </Text>
          <Text className="text-black/50">Duy trì trạng thái đăng xuất</Text>
        </View>
      </View>
    </View>
  );
};

export default Signin;
