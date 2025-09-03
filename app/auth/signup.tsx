import InputWithIcon from "@/components/InputWithIcon";
import { images } from "@/constants/image";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setErrorMessage("Email không hợp lệ");
    } else {
      setErrorMessage("");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const handleSignup = () => {
    // Check account in database
    //True -> send OTP
    //False -> show error message
  };

  const googleSignin = () => {
    //Signin with google
    //Return data to storage in database
  };

  const localData = () => {
    //Setup an AsyncStorage to store data
  };

  return (
    <View className="font-lato-regular flex-1 items-center py-10 h-full">
      <Text className="text-2xl font-bold text-center py-20">Đăng ký</Text>
      <Image
        source={images.star}
        className="-z-10 absolute top-1/5 -right-[10%] w-[100px] h-[100px]"
      />
      <Image
        source={images.star}
        className="-z-10 absolute top-[20%] -left-[15%] w-[100px] h-[100px]"
      />
      <View className="flex-1 items-center justify-center w-full gap-[5%] z-10 bg-white/40 backdrop-blur-md px-5">
        <InputWithIcon
          icon="envelope"
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
        />

        <InputWithIcon
          icon="key"
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <InputWithIcon
          icon="key"
          placeholder="Xác nhận mật khẩu"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          className="flex items-center justify-center py-4 w-full bg-cyan-blue rounded-full"
          onPress={handleSignup}
        >
          <Text className="text-white">Đăng ký</Text>
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
            Đã có tài khoản ?{" "}
            <Link href={"/auth/signin"} className="text-cyan-blue">
              Đăng nhập
            </Link>
          </Text>
          <Text className="text-black/50">Duy trì trạng thái đăng xuất</Text>
        </View>
      </View>
    </View>
  );
};

export default Signup;
