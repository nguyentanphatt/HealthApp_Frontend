import { VideoType } from '@/constants/type';
import { getWorkoutVideo } from '@/services/workout';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

const index = () => {
    const [category, setCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const value = await AsyncStorage.getItem('workout_category');
                if (!value) {
                    console.log('Không có category');
                }
                console.log('category', value);
                setCategory(value);
            } finally {
                setLoading(false);
            }
        })();
    }, [])

    const getVideo = async () => {
        if (!category) return;
        try {
            setLoadingVideos(true);
            const res = await getWorkoutVideo(category ?? '');
            console.log("res", res);
            if (res?.success && Array.isArray(res.videos)) {
                setVideos(res.videos);
            }
        } finally {
            setLoadingVideos(false);
        }
    }
    useEffect(() => {
        getVideo();
    }, [category]);

    if (loading) {
        return (
            <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size="large" color="#19B1FF" />
                <Text className='mt-3'>Đang tải...</Text>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-white pt-12 px-4'>
            <View className="flex flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => (router.push('/(tabs)' as Href))} className="w-[30px]">
                        <FontAwesome6 name="chevron-left" size={24} color="black" />
                    </TouchableOpacity> 
                    <Text className="text-2xl font-bold text-center py-5">
                        {t("Đề xuất luyện tập")}
                    </Text>
                    <TouchableOpacity onPress={() => (router.push('/(tabs)' as Href))} className="w-[30px]">
                        <FontAwesome6 name="ellipsis-vertical" size={24} color="black" />
                    </TouchableOpacity> 
                </View>

            {loadingVideos ? (
                <View className='flex-1 items-center justify-center'>
                    <ActivityIndicator size="large" color="#19B1FF" />
                    <Text className='mt-3'>Đang tải video...</Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.videoId}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
                    renderItem={({ item }) => (
                        <View className='w-[48%] rounded-lg bg-gray-50 p-3'>
                            <Image source={{ uri: item.thumbnail }} className='w-full h-[100px] rounded-md' />
                            <View className='mt-2'>
                                <Text numberOfLines={2} className='text-base font-semibold'>{item.title}</Text>
                                <Text className='text-sm text-gray-600 mt-1'>by {item.channelTitle}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View className='flex-1 items-center justify-center mt-10'>
                            <Text>Không có video phù hợp</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            )}
        </View>
    )
}

export default index