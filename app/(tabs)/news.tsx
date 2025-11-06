import FilterSelector from '@/components/FilterSelector';
import { options, sortOptions } from '@/constants/data';
import { images } from '@/constants/image';
import { useAppTheme } from '@/context/appThemeContext';
import { getBlogs, getBlogsByUserId, likeBlog } from '@/services/blog';
import { useUserStore } from '@/stores/useUserStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

dayjs.extend(utc);
dayjs.extend(timezone);

const News = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [selectedTag, setSelectedTag] = useState({ label: "Tất cả", value: "all" });
  const [selectedSort, setSelectedSort] = useState({ label: "Mới nhất", value: "newest" });
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const getCategoryLabel = (value: string) => {
    const opt = options.find(o => o.value === value);
    return opt ? opt.label : value;
  };

  const buildQueryParams = () => {
    const params: any = { page };

    if (selectedTag.value !== "all") {
      params.category = selectedTag.value;
    }

    if (selectedSort.value === "favorite-increase") {
      params.heart = "asc";
    } else if (selectedSort.value === "favorite-decrease") {
      params.heart = "desc";
    } else if (selectedSort.value === "newest") {
      params.date = "desc";
    } else if (selectedSort.value === "oldest") {
      params.date = "asc";
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

  const likeBlogMutation = useMutation({
    mutationFn: async (id: number) => {
      return likeBlog(id);
    },
    onMutate: async (blogId: number) => {
      await queryClient.cancelQueries({ predicate: (q: any) => Array.isArray(q.queryKey) && (q.queryKey[0] === "blogs" || q.queryKey[0] === "blogsByUserId") });

      const previousBlogs = queryClient.getQueriesData({ predicate: (q: any) => Array.isArray(q.queryKey) && (q.queryKey[0] === "blogs" || q.queryKey[0] === "blogsByUserId") });

      queryClient.setQueriesData(
        { predicate: (q: any) => Array.isArray(q.queryKey) && (q.queryKey[0] === "blogs" || q.queryKey[0] === "blogsByUserId") },
        (old: any) => {
          if (!old) return old;
          
          const updatedBlogs = old.blogs?.map((blog: any) => {
            if (blog.id === blogId) {
              return {
                ...blog,
                liked: !blog.liked,
                likes: blog.liked ? blog.likes - 1 : blog.likes + 1
              };
            }
            return blog;
          });

          return {
            ...old,
            blogs: updatedBlogs
          };
        }
      );

      setAllBlogs(prevBlogs => 
        prevBlogs.map(blog => {
          if (blog.id === blogId) {
            return {
              ...blog,
              liked: !blog.liked,
              likes: blog.liked ? blog.likes - 1 : blog.likes + 1
            };
          }
          return blog;
        })
      );

      return { previousBlogs };
    },
    onError: (err, blogId, context) => {
      if (context?.previousBlogs) {
        context.previousBlogs.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      setAllBlogs(prevBlogs => 
        prevBlogs.map(blog => {
          if (blog.id === blogId) {
            return {
              ...blog,
              liked: !blog.liked,
              likes: blog.liked ? blog.likes + 1 : blog.likes - 1
            };
          }
          return blog;
        })
      );
      
      console.log("Error liking blog:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q: any) => Array.isArray(q.queryKey) && (q.queryKey[0] === "blogs" || q.queryKey[0] === "blogsByUserId") });
    },
  });

  const initialLoading = (type === 'user' ? isLoadingByUserId : isLoading) && page === 1;
  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.textPrimary} />
      </View>
    );
  }


  return (
    <View className="flex-1 pt-12 relative" style={{ backgroundColor: theme.colors.background }}>
      <View className="flex px-4" style={{ backgroundColor: theme.colors.background }}>
          <View className='flex flex-row items-center justify-between'>
            {type === "user" ? (
              <TouchableOpacity onPress={() => router.push(`/(tabs)/news` as Href)} className='size-14 rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.secondaryCard }}>
                <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View className='size-14 rounded-full' style={{ backgroundColor: theme.colors.background }} />
            )}
            <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{type === "user" ? t("Cá nhân") : t("Cộng đồng")}</Text>
            <TouchableOpacity onPress={() => router.push(`/(tabs)/news?type=user` as Href)}>
              <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.noImg} className='size-14 bg-gray-300 rounded-full' />
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
      <ScrollView
        className="flex-1 gap-2.5 font-lato-regular" style={{ backgroundColor: theme.colors.background }}
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
        {allBlogs.length === 0 && (
          <View className="py-4 items-center">
            <Text className="text-cyan-blue">{t("Không có bài viết")}</Text>
          </View>
        )}

        {allBlogs.map((item, idx) => (
          <TouchableOpacity className='px-4 py-2.5' key={idx} onPress={() => router.push(`/news/details/${item.id}` as Href)}>
            <View className='relative rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4' style={{ backgroundColor: theme.colors.card }}>
              <Image
                source={item.image ? { uri: item.image } : images.noImg}
                className='w-full h-[150px] rounded-lg'
                width={300}
                height={250}
              />
              <View className='absolute top-4 right-4 flex items-center justify-center bg-cyan-blue rounded-full px-4 py-2'>
                <Text className='' style={{ color: theme.mode === "dark" ? theme.colors.textPrimary : "#fff" }}>{t(getCategoryLabel(item.category))}</Text>
              </View>
              <Text className='text-center text-3xl font-bold' style={{ color: theme.colors.textPrimary }}>{item.title}</Text>

              <View className=''>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className="text-xl leading-5" style={{ color: theme.colors.textSecondary }}
                >
                  {item.content}
                </Text>
                <View className='flex-row items-center justify-between'>
                  <TouchableOpacity className="mt-4" onPress={() => router.push(`/news/details/${item.id}` as Href)}>
                    <Text className="text-cyan-blue font-semibold">{t("Xem thêm")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="mt-2 flex-row items-center justify-center gap-2" onPress={() => likeBlogMutation.mutate(item.id)}>
                    {item.liked ? (
                      <View className='w-[20px] h-[20px] flex items-center justify-center'>
                        <Image source={images.heart} className='w-[17px] h-[15px]' width={20} height={20} />
                      </View>
                    ) : (
                      <FontAwesome6 name="heart" size={20} color="#ff6467" />
                    )}
                    <Text className="text-red-400 font-semibold w-[20px] text-center">{item.likes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className='w-full h-[1px] my-4' style={{ backgroundColor: theme.colors.border }} />
              <View className='flex flex-row items-center gap-5'>
                <View className='flex flex-row items-center gap-2'>
                  <FontAwesome6 name="user" size={20} color={theme.colors.textPrimary} />
                  <Text className='text-lg' style={{ color: theme.colors.textSecondary }}>{item.userName}</Text>
                </View>
                <View className='flex flex-row items-center gap-2 ml-2'>
                  <FontAwesome6 name="calendar" size={20} color={theme.colors.textPrimary} />
                  <Text className='text-lg' style={{ color: theme.colors.textSecondary }}>
                    {dayjs(item.createAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}
                  </Text>
                </View>

              </View>
              {item.updateAt && (
                <View className='w-full flex flex-row items-center'>
                  <Text className='' style={{ color: theme.colors.textSecondary }}>{"("}{t("Ngày cập nhật:")}</Text>

                  <Text className='ml-2' style={{ color: theme.colors.textPrimary }}>
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
        <FontAwesome6 name="plus" size={24} color={theme.mode === "dark" ? theme.colors.textPrimary : "#fff"} />
      </TouchableOpacity>
    </View>
  )
}

export default News