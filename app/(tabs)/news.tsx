import FilterSelector from '@/components/FilterSelector';
import { images } from '@/constants/image';
import { FontAwesome6 } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const News = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedTag, setSelectedTag] = useState({ label: "Tất cả", value: "all" });
  const [dropdown, setDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState({ label: "Mới nhất", value: "newest" });
  const options = [
    {
      id: 1,
      label: "Tất cả",
      value: "all",
    },
    {
      id: 2,
      label: "Nước",
      value: "water",
    },
    {
      id: 3,
      label: "Thức ăn",
      value: "food",
    },

    {
      id: 4,
      label: "Vận động",
      value: "fitness",
    },

    {
      id: 5,
      label: "Giấc ngủ",
      value: "sleep",
    },

    {
      id: 6,
      label: "Khác",
      value: "other",
    },
  ]

  const sortOptions = [
    {
      id: 1,
      label: "Mới nhất",
      value: "newest",
    },
    {
      id: 1,
      label: "Cũ nhất",
      value: "oldest",
    },
    {
      id: 1,
      label: "Yêu thích ↑",
      value: "favorite-increase",
    },
    {
      id: 1,
      label: "Độ yêu ↓",
      value: "favorite-decrease",
    },
  ]
  return (
    <View className="flex-1 relative">
      <ScrollView
        className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex bg-[#f6f6f6] pt-16">
          <Text className="text-2xl font-bold  self-center">{t("Tin tức")}</Text>
        </View>

        <View className='flex flex-row items-center justify-between py-5'>
          <FilterSelector 
            label="Phân loại"
            options={options}
            selected={selectedTag}
            setSelected={setSelectedTag}
          />

          <FilterSelector 
            label="Sắp xếp"
            options={sortOptions}
            selected={selectedSort}
            setSelected={setSelectedSort}
          />
        </View>

        <View className=' py-2.5'>
          <View className='relative bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4'>
            <Image source={images.food01} className='w-full h-[150px] rounded-lg' width={300} height={250} />
            <View className='absolute top-4 right-4 flex items-center justify-center bg-cyan-blue rounded-full px-4 py-2'>
              <Text className='text-white'>Fitness</Text>
            </View>
            <Text className='text-center text-3xl font-bold'>A day with fitness</Text>

            <View className='flex flex-row items-center justify-center gap-2'>
              <Text className='text-black/60 text-lg'>Hieu Phan Trung</Text>
              <Text className='text-black/60 text-lg'>20/09/2025 12:00</Text>
            </View>
            <View className='border-t border-black/10 pt-4'>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                className="text-black/70 text-base leading-5"
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
              </Text>
              <View className='flex-row items-center justify-between'>
              <TouchableOpacity className="mt-2" onPress={() => router.push(`/news/details/1` as Href)}>
                <Text className="text-cyan-blue font-semibold">{t("Xem thêm")}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="mt-2 flex-row items-center justify-center gap-2">
                <FontAwesome6 name="heart" size={20} color="red" />
                <Text className="text-red-400 font-semibold w-[20px] text-center">36</Text>
              </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      <TouchableOpacity 
      onPress={() => router.push(`/news/add` as Href)}
      className='absolute bottom-4 right-4 w-[60px] h-[60px] flex items-center justify-center bg-cyan-blue rounded-full shadow-lg'>
        <FontAwesome6 name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

export default News