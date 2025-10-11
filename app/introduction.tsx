import { AnimatedIndicator } from "@/components/AnimatedIndicator";
import { introductionData } from "@/constants/data";
import i18n from "@/plugins/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
const Introduction = () => {
    const router = useRouter()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [currentLanguage, setCurrentLanguage] = useState<'vi' | 'en'>('vi')
    const { t } = useTranslation();
    // Load language from storage on mount
    useEffect(() => {
      const loadLanguage = async () => {
        try {
          const stored = await AsyncStorage.getItem('temp_language');
          if (stored === 'en' || stored === 'vi') {
            setCurrentLanguage(stored);
            await i18n.changeLanguage(stored);
          }
        } catch (error) {
          console.error('Error loading language:', error);
        }
      };
      loadLanguage();
    }, []);

    const handleContinue = async () => {
      console.log('handleContinue');
      
        await AsyncStorage.setItem('hasSeenIntroduction', 'true');
        router.push("/auth/signin");
      console.log('handleContinue done');
      
    }

    const toggleLanguage = async () => {
      console.log("click");
      
      const newLang = currentLanguage === 'vi' ? 'en' : 'vi';
      setCurrentLanguage(newLang);
      await AsyncStorage.setItem('temp_language', newLang);
      await i18n.changeLanguage(newLang);
    };
  return (
    <View className="font-lato-regular flex-1 items-center justify-center gap-20 py-16 w-full relative">
      <TouchableOpacity
        onPress={toggleLanguage}
        className="absolute top-12 right-4 px-6 py-3 z-50"
      >
        <Text className="text-lg font-bold text-cyan-blue">
          {currentLanguage === 'vi' ? 'EN' : 'VI'}
        </Text>
      </TouchableOpacity>
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
                {t(item.title)}
              </Text>
              <Text className="text-base text-center text-black/50">
                {t(item.description)}
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
        <Text className="text-white">{t("Bắt đầu")}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Introduction;