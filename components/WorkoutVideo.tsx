import { VideoType } from '@/constants/type';
import { useAppTheme } from '@/context/appThemeContext';
import { getWorkoutVideo, resetWorkoutVideo } from '@/services/workout';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

const LIMIT = 6;

const WorkoutVideo = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["videos", page],
    queryFn: () => getWorkoutVideo({ page, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data?.videos) {
      if (page === 1) setVideos(data.videos);
      else setVideos((prev) => [...prev, ...data.videos]);
      setIsFetchingMore(false);
    }
  }, [data]);

  const loadMore = () => {
    if (isFetchingMore || isFetching) return;
    if (data?.videos?.length && data.videos.length < LIMIT) return;
    setIsFetchingMore(true);
    setPage((prev) => prev + 1);
  };

  if (isLoading && videos.length === 0) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" color="#19B1FF" />
      </View>
    );
  }

  return (
    <View className='flex-1 px-4 pt-12' style={{ backgroundColor: theme.colors.background }}>
      <View className="flex flex-row items-center justify-between">
        <TouchableOpacity onPress={() => (router.push('/(tabs)' as Href))} className="w-[30px]">
          <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-center py-5" style={{ color: theme.colors.textPrimary }}>
          {t("Đề xuất luyện tập")}
        </Text>
        <TouchableOpacity onPress={() => setOpenMenu(!openMenu)} className="w-[30px]">
          <FontAwesome6 name="ellipsis-vertical" size={24} color={theme.colors.textPrimary} />
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
            className="absolute top-16 right-6 rounded-md shadow-xl z-50 w-40 p-4"
            style={{ backgroundColor: theme.colors.secondaryCard, elevation: 5 }}
          >
            <TouchableOpacity
              onPress={async () => {
                setOpenMenu(false);
                await AsyncStorage.removeItem('workout_category');
                await resetWorkoutVideo();
                router.push('/(tabs)/work' as Href);
              }}
              className="py-2"
            >
              <Text className='text-lg' style={{ color: theme.colors.textPrimary }}>Đặt lại mục tiêu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={videos}
        keyExtractor={(item) => item.videoId}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }: { item: VideoType }) => (
          <View className='w-[48%] rounded-lg' style={{ backgroundColor: theme.colors.card }}>
            <TouchableOpacity onPress={() => router.push(`/work/details/${item.videoId}` as Href)}>
              <Image source={{ uri: item.thumbnail }} className='w-full h-[100px] rounded-md' />
              <View className='mt-2'>
                <Text numberOfLines={2} className='text-base font-semibold' style={{ color: theme.colors.textPrimary }}>{item.title}</Text>
                <Text className='text-sm mt-1' style={{ color: theme.colors.textSecondary }}>by {item.channelTitle}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() =>
          isFetchingMore ? (
            <View className='py-4 items-center'>
              <ActivityIndicator size="small" color="#19B1FF" />
              <Text className='mt-2' style={{ color: theme.colors.textSecondary }}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View className='flex-1 items-center justify-center mt-10'>
            <Text style={{ color: theme.colors.textSecondary }}>Không có video phù hợp</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default WorkoutVideo;
