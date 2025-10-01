import { images } from '@/constants/image';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const NewsDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    return (
        <ScrollView
            className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="flex bg-[#f6f6f6] pt-16 py-10">
                <View className="flex flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome6 name="chevron-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold  self-center">{t("Tin tức")}</Text>
                    <TouchableOpacity>
                        <FontAwesome6 name="heart" size={20} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex items-center justify-center gap-2">
                <Text className="text-3xl font-bold">{t("A day with fitness")}</Text>
                <View className='flex flex-row items-center justify-center gap-2 mb-10'>
                    <Text className='text-black/60 text-lg'>Hieu Phan Trung</Text>
                    <Text className='text-black/60 text-lg'>20/09/2025 12:00</Text>
                </View>
                <Image
                    /* source={
                      foodDetail?.imageUrl ? { uri: foodDetail.imageUrl } : images.food01
                    } */
                    source={images.food01}
                    width={300}
                    height={300}
                    className="w-[350px] h-[300px] rounded-lg"
                />
                <Text className="text-base text-black/70">{t("Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.")}</Text>


            </View>
            {/* {isChanged && (
        <View className="flex-row items-center justify-between py-5">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            className="self-center flex-row items-center bg-white justify-center w-[45%] py-3 rounded-md"
          >
            <Text className="text-xl text-black font-bold ">{t("Hủy")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleSave(id as string, hour, minute, selectedMeal);
            }}
            className="self-center flex-row items-center justify-center bg-cyan-blue w-[45%] py-3 rounded-md"
          >
            <Text className="text-xl text-white font-bold ">{t("Hoàn tất")}</Text>
          </TouchableOpacity>
        </View>
      )} */}
        </ScrollView>
    )
}

export default NewsDetails