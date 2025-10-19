import { VideoType } from '@/constants/type';
import { getWorkoutVideo } from '@/services/workout';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

const index = () => {
    const [category, setCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState(false);
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

    const {
        data,
        isLoading: loadingVideo,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: refetchVideo,
    } = useInfiniteQuery({
        queryKey: ["videos", category],
        queryFn: ({ pageParam = 1 }) =>
            getWorkoutVideo({ page: pageParam as number, limit: 6 }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages) => {
            if (lastPage.videos.length < 6) return undefined;
            return allPages.length + 1;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!category,
    });

    const videos = data?.pages.flatMap((page: any) => page.videos) ?? [];
    console.log("videos", videos);
    
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
                <TouchableOpacity onPress={() => setOpenMenu(!openMenu)} className="w-[30px]">
                    <FontAwesome6 name="ellipsis-vertical" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {openMenu && (
                <View className="absolute inset-0 z-40">
                    <TouchableOpacity
                        className="absolute inset-0"
                        activeOpacity={1}
                        onPress={() => setOpenMenu(false)}
                    />
                    <View
                        className="absolute top-16 right-6 bg-white rounded-md shadow-xl z-50 w-40 p-4"
                        style={{ elevation: 5 }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setOpenMenu(false);
                                AsyncStorage.removeItem('workout_category');
                                router.push('/(tabs)/work' as Href);
                            }}
                            className="py-2"
                        >
                            <Text className='text-lg text-black'>Đặt lại mục tiêu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {loadingVideo ? (
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
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    renderItem={({ item }: { item: VideoType }) => (
                        <View className='w-[48%] rounded-lg bg-gray-50 p-3'>
                            <TouchableOpacity onPress={() => router.push(`/work/details/${item.videoId}` as Href)}>
                                <Image source={{ uri: item.thumbnail }} className='w-full h-[100px] rounded-md' />
                                <View className='mt-2'>
                                    <Text numberOfLines={2} className='text-base font-semibold'>{item.title}</Text>
                                    <Text className='text-sm text-gray-600 mt-1'>by {item.channelTitle}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListFooterComponent={() => (
                        isFetchingNextPage ? (
                            <View className='py-4 items-center'>
                                <ActivityIndicator size="small" color="#19B1FF" />
                                <Text className='mt-2 text-gray-600'>Đang tải thêm...</Text>
                            </View>
                        ) : null
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