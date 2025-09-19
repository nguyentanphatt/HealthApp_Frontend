import { AnimatedIndicator } from "@/components/AnimatedIndicator";
import { introductionData } from "@/constants/data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
const Introduction = () => {
    const router = useRouter()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const handleContinue = async () => {
      console.log('handleContinue');
      
        await AsyncStorage.setItem('hasSeenIntroduction', 'true');
        router.push("/auth/signin");
      console.log('handleContinue done');
      
    }
  return (
    <View className="font-lato-regular flex-1 items-center justify-center gap-20 py-16 w-full">
      <Swiper
        loop={false}
        showsPagination={false}
        onIndexChanged={setSelectedIndex}
        className="h-[400px]"
      >
        {introductionData.map((item) => (
          <View
            key={item.id}
            className="flex-1 items-center justify-center gap-10"
          >
            <Image
              source={item.image}
              className="w-[90%] h-[300px] mt-32"
              resizeMode="contain"
            />
            <Image
              source={item.blurBg}
              className="w-[450px] h-[450px] absolute -z-10 top-1/8 left-[20%] rounded-full"
            />
            <View className="flex gap-5 px-12 ">
              <Text className="font-bold text-2xl text-center">
                {item.title}
              </Text>
              <Text className="text-base text-center text-black/50">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </Swiper>
      <View className="flex flex-row">
        {introductionData.map((item, index) => (
          <AnimatedIndicator key={item.id} active={selectedIndex === index} />
        ))}
      </View>
      <TouchableOpacity
        className="flex items-center justify-center py-4 w-[230px] bg-cyan-blue rounded-full"
        onPress={handleContinue}
      >
        <Text className="text-white">Bắt đầu</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Introduction;