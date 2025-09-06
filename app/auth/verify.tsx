import { images } from "@/constants/image";
import { sendOtp, verifyOtp } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-toast-message";
const Verify = () => {
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(5 * 60);

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
      }
    };
    loadEmail();
  }, []);

  const handleVerify = async(otp:string) => {
    try {
     const response = await verifyOtp(email, otp);
     if(response.success){
      if(type === 'signup'){
        Toast.show({
          type: "success",
          text1: "Đăng ký thành công",
        });
        router.push("/auth/signin");
      } else {
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công"
        });
        router.push("/(tabs)");
      }
      
     } 
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      Toast.show({
        type: "error",
        text1: err.response?.data.message,
      });
    }
  }

  const resend = async () => {
    try {
      await sendOtp(email)
      Toast.show({
        type: "success",
        text1: "Đã gửi lại mã OTP",
      });
    } catch (error) {
      throw error
    }
  }

  return (
    <View className="font-lato-regular flex-1 items-center py-10 h-full">
      <View className="py-20">
        <Text className="text-2xl font-bold text-center">Xác thực OTP</Text>
        <Text className="text-center text-black/50 mt-2">
          Chúng tôi đã gửi OTP qua mail của bạn
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
      <View className="flex-1 items-center w-full gap-[5%] z-10 bg-white/40 backdrop-blur-md px-5">
        <View className="w-full flex items-center pt-10">
          <OtpInput
            numberOfDigits={6}
            focusColor="#19B1FF"
            onTextChange={(text) => setOtp(text)}
            textInputProps={{
              keyboardType: "numeric",
            }}
            theme={{
              containerStyle: {
                width: "90%",
              },
              pinCodeContainerStyle: {
                backgroundColor: "white",
                borderRadius: 4,
                borderColor: "#E5E7EB",
              },
              pinCodeTextStyle: {
                color: "black",
                fontSize: 20,
              },
            }}
          />
          <Text className="self-end mt-2 px-5">{formatTime(timeLeft)}</Text>
        </View>
        <TouchableOpacity onPress={resend}>
          <Text className="text-cyan-blue text-center" >
            Gửi lại OTP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center justify-center py-4 w-full bg-cyan-blue rounded-full"
          onPress={() => handleVerify(otp)}
        >
          <Text className="text-white">Xác thực</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Verify;
