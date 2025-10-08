import FilterSelector from '@/components/FilterSelector';
import { options, sortOptions } from '@/constants/data';
import { images } from '@/constants/image';
import { getBlogs, getBlogsByUserId } from '@/services/blog';
import { useUserStore } from '@/stores/useUserStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Configure dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const News = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { t } = useTranslation();
  const [selectedTag, setSelectedTag] = useState({ label: "Tất cả", value: "all" });
  const [selectedSort, setSelectedSort] = useState({ label: "Mới nhất", value: "newest" });
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useUserStore((state) => state.user);

  const getCategoryLabel = (value: string) => {
    const opt = options.find(o => o.value === value);
    return opt ? opt.label : value;
  };

  const buildQueryParams = () => {
    const params: any = { page };

    if (selectedTag.value !== "all") {
      params.category = selectedTag.value;
    }

    // Only pass heart sorting to backend; newest/oldest handled client-side
    if (selectedSort.value === "favorite-increase") {
      params.heart = "asc";
    } else if (selectedSort.value === "favorite-decrease") {
      params.heart = "desc";
    }

    return params;
  };

  const { data: blogs, isLoading, refetch } = useQuery({
    queryKey: ["blogs", selectedTag.value, selectedSort.value, page],
    queryFn: () => getBlogs(buildQueryParams()),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const { data: blogsByUserId, isLoading: isLoadingByUserId, refetch: refetchByUserId } = useQuery({
    queryKey: ["blogsByUserId", selectedTag.value, selectedSort.value, page],
    queryFn: () => getBlogsByUserId(buildQueryParams()),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setAllBlogs([]);
    try {
      if (type === 'user') {
        await refetchByUserId();
      } else {
        await refetch();
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const source = type === 'user' ? blogsByUserId : blogs;
    if (source) {
      const newBlogs = source.blogs || [];
      let merged = page === 1 ? newBlogs : [...allBlogs, ...newBlogs];

      if (selectedSort.value === "newest") {
        merged = [...merged].sort((a, b) => new Date(b.createAt || b.createAt || b.create_at).getTime() - new Date(a.createAt || a.createAt || a.create_at).getTime());
      } else if (selectedSort.value === "oldest") {
        merged = [...merged].sort((a, b) => new Date(a.createAt || a.createAt || a.create_at).getTime() - new Date(b.createAt || b.createAt || b.create_at).getTime());
      }

      setAllBlogs(merged);
      setHasMore(newBlogs.length === 10);
      setIsLoadingMore(false);
    }
  }, [blogs, blogsByUserId, page, selectedSort.value, type, refreshing]);

  const handleTagChange = (tag: { label: string, value: string }) => {
    if (selectedTag.value === tag?.value) return;
    setSelectedTag(tag);
    setPage(1);
    setAllBlogs([]);
  };

  const handleSortChange = (sort: { label: string, value: string }) => {
    if (selectedSort.value === sort?.value) return;
    setSelectedSort(sort);
    setPage(1);
    setAllBlogs([]);
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  const initialLoading = (type === 'user' ? isLoadingByUserId : isLoading) && page === 1;
  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }


  return (
    <View className="flex-1 relative">
      <ScrollView
        className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#19B1FF"
            colors={["#19B1FF"]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View className="flex bg-[#f6f6f6] pt-16">
          <View className='flex flex-row items-center justify-between'>
            {type === "user" ? (
              <TouchableOpacity onPress={() => router.push(`/(tabs)/news` as Href)} className='size-14 bg-[#f6f6f6] rounded-full flex items-center justify-center'>
                <FontAwesome6 name="chevron-left" size={24} color="black" />
              </TouchableOpacity>
            ) : (
              <View className='size-14 bg-[#f6f6f6] rounded-full' />
            )}
            <Text className="text-2xl font-bold  self-center">{type === "user" ? t("Cá nhân") : t("Cộng đồng")}</Text>
            <TouchableOpacity onPress={() => router.push(`/(tabs)/news?type=user` as Href)}>
              <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.noImg} className='size-14 bg-red-500 rounded-full' />
            </TouchableOpacity>
          </View>
          <View className='flex flex-row items-center justify-between py-5'>
            <FilterSelector
              label="Phân loại"
              options={options}
              selected={selectedTag}
              setSelected={handleTagChange}
            />

            <FilterSelector
              label="Sắp xếp"
              options={sortOptions}
              selected={selectedSort}
              setSelected={handleSortChange}
            />
          </View>
        </View>

        {allBlogs.map((item, idx) => (
          <TouchableOpacity className=' py-2.5' key={idx} onPress={() => router.push(`/news/details/${item.id}` as Href)}>
            <View className='relative bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4'>
              <Image
                source={item.image ? { uri: item.image } : images.noImg}
                className='w-full h-[150px] rounded-lg'
                width={300}
                height={250}
              />
              <View className='absolute top-4 right-4 flex items-center justify-center bg-cyan-blue rounded-full px-4 py-2'>
                <Text className='text-white'>{t(getCategoryLabel(item.category))}</Text>
              </View>
              <Text className='text-center text-3xl font-bold'>{item.title}</Text>

              <View className=''>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className="text-black/70 text-xl leading-5"
                >
                  {item.content}
                </Text>
                <View className='flex-row items-center justify-between'>
                  <TouchableOpacity className="mt-4" onPress={() => router.push(`/news/details/${item.id}` as Href)}>
                    <Text className="text-cyan-blue font-semibold">{t("Xem thêm")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="mt-2 flex-row items-center justify-center gap-2">
                    <FontAwesome6 name="heart" size={20} color="red" />
                    <Text className="text-red-400 font-semibold w-[20px] text-center">{item.likes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className='w-full h-[1px] bg-black/20 my-4' />
              <View className='flex flex-row items-center gap-5'>
                <View className='flex flex-row items-center gap-2'>
                  <FontAwesome6 name="user" size={20} color="black" />
                  <Text className='text-black/60 text-lg'>{item.userName}</Text>
                </View>
                <View className='flex flex-row items-center gap-2 ml-2'>
                  <FontAwesome6 name="calendar" size={20} color="black" />
                  <Text className='text-black/60 text-lg'>
                    {dayjs(item.createAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}
                  </Text>
                </View>

              </View>
              {item.updateAt && (
                <View className='w-full flex flex-row items-center'>
                  <Text className='text-black/60'>{"("}{t("Ngày cập nhật:")}</Text>

                  <Text className='text-black text ml-2'>
                    {dayjs(item.updateAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}{")"}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {isLoadingMore && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#19B1FF" />
            <Text className="text-cyan-blue mt-2">{t("Đang tải bài viết mới...")}</Text>
          </View>
        )}

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