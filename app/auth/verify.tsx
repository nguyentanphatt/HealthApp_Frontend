import { images } from "@/constants/image";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
const Verify = () => {
  const [otp, setOtp] = useState("");

  const handleVerify = (otp:string) => {

  }

  const resend = () => {

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
        <Text className="text-cyan-blue text-center" onPress={resend}>Gửi lại OTP</Text>
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
