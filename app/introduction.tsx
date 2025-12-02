import { AnimatedIndicator } from "@/components/AnimatedIndicator";
import { introductionData } from "@/constants/data";
import i18n from "@/plugins/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const Introduction = () => {
    const router = useRouter()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [currentLanguage, setCurrentLanguage] = useState<'vi' | 'en'>('vi')
    const { t } = useTranslation();
    const flatListRef = useRef<FlatList>(null);

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

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / SCREEN_WIDTH);
      setSelectedIndex(index);
    };

    const renderItem: ListRenderItem<typeof introductionData[0]> = ({ item }) => (
      <View
        style={{ 
          width: SCREEN_WIDTH,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 40
        }}
      >
        <View 
          style={{ 
            position: 'relative',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            height: 280,
            marginBottom: 20
          }}
        >
          <Image
            source={item.blurBg}
            style={{ 
              position: 'absolute',
              width: 550,
              height: 550,
              opacity: 0.5,
              zIndex: -1
            }}
            resizeMode="contain"
          />
          <Image
            source={item.image}
            style={{ 
              width: '85%',
              maxWidth: 280,
              height: 250
            }}
            resizeMode="contain"
          />
        </View>
        <View 
          style={{ 
            width: SCREEN_WIDTH - 40,
            paddingHorizontal: 20,
            alignItems: 'center'
          }}
        >
          <Text 
            style={{ 
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#000',
              width: '100%',
              marginBottom: 12
            }}
            numberOfLines={2}
          >
            {t(item.title)}
          </Text>
          <Text 
            style={{ 
              fontSize: 16,
              textAlign: 'center',
              color: '#666',
              width: '100%',
              lineHeight: 22
            }}
            numberOfLines={3}
          >
            {t(item.description)}
          </Text>
        </View>
      </View>
    );

  return (
    <View className="font-lato-regular flex-1 items-center justify-center w-full relative" style={{ paddingTop: 60 }}>
      <TouchableOpacity
        onPress={toggleLanguage}
        style={{
          position: 'absolute',
          top: 60,
          right: 16,
          paddingHorizontal: 24,
          paddingVertical: 12,
          zIndex: 50
        }}
      >
        <Text className="text-lg font-bold text-cyan-blue">
          {currentLanguage === 'vi' ? 'EN' : 'VI'}
        </Text>
      </TouchableOpacity>
      <View style={{ flex: 1, width: '100%' }}>
        <FlatList
          ref={flatListRef}
          data={introductionData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: '100%' }}
          contentContainerStyle={{ width: SCREEN_WIDTH * introductionData.length }}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
      </View>
      <View className="flex flex-row mb-10">
        {introductionData.map((item, index) => (
          <AnimatedIndicator key={item.id} active={selectedIndex === index} />
        ))}
      </View>
      <TouchableOpacity
        className="flex items-center justify-center py-4 mb-20 w-[230px] bg-cyan-blue rounded-full"
        onPress={handleContinue}
      >
        <Text className="text-white">{t("Bắt đầu")}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Introduction;