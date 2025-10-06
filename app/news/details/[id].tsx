import ActionModal from '@/components/modal/ActionModal';
import { images } from '@/constants/image';
import { deleteBlog, getBlogById } from '@/services/blog';
import { useModalStore } from '@/stores/useModalStore';
import { useUserStore } from '@/stores/useUserStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
const NewsDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const [isLiked, setIsLiked] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const { openModal } = useModalStore();
  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id as string),
    select: (res) => res.blogs,
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("id", id);
      
      return deleteBlog(id);
    },
    onSuccess: (res) => {
      if (res.success) {
        Toast.show({
          type: "success",
          text1: t("Xoá thành công"),
        });
      }
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === "blogs" || q.queryKey[0] === "blogsByUserId"), refetchType: 'active' });
      router.push(`/news` as Href);
    },
    onError: (err) => {
      console.log("Error deleting blog:", err);
    },
  });

  if (isLoading || !blog) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  
  return (
    <View className='flex-1 relative'>
      <ScrollView
        className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex bg-[#f6f6f6] pt-16 py-10">
          <View className="flex flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className='size-[24px] rounded-full bg-[#f6f6f6] flex items-center justify-center'>
              <FontAwesome6 name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold  self-center">{t("Bài viết")}</Text>
            {blog[0]?.userName === user?.fullName ? (
              <TouchableOpacity onPress={() => setShowAction(true)} className='size-[24px] rounded-full bg-[#f6f6f6] flex items-center justify-center'>
                <FontAwesome6 name="ellipsis-vertical" size={24} color="black" />
              </TouchableOpacity>
            ) : (
              <View className='size-[14px] rounded-full bg-[#f6f6f6]' />
            )}
          </View>
        </View>
        <View className="flex items-center justify-center gap-2">
          <Text className="text-3xl font-bold">{blog[0]?.title}</Text>
          <View className='flex flex-row items-center justify-center gap-2 mb-10'>
            <Text className='text-black/60 text-lg'>{blog[0]?.userName}</Text>
            <Text className='text-black/60 text-lg'>{dayjs(blog[0]?.createAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}</Text>
          </View>
          <Image
            source={blog[0]?.image ? { uri: blog[0].image } : images.noImg}
            width={300}
            height={300}
            className="w-[350px] h-[300px] rounded-lg"
          />
          <Text className="text-base self-start text-black/70">{blog[0]?.content}</Text>


        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => router.push(`/news/add` as Href)}
        className='absolute bottom-28 right-4 w-[60px] h-[60px] flex items-center justify-center bg-cyan-blue rounded-full'>
        <FontAwesome6 name="share" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsLiked(!isLiked)}
        className='absolute bottom-8 right-4 w-[60px] h-[60px] flex items-center justify-center bg-red-400 rounded-full'>
        {isLiked === false ? <FontAwesome6 name="heart" size={24} color="white" /> : (
          <View className='flex items-center justify-center'>
            <Image source={images.heart} className='w-[25px] h-[22px]' width={24} height={24} />
            <Text className='text-white'>{blog[0]?.likes}</Text>
          </View>
        )}
      </TouchableOpacity>
      <ActionModal
        visible={showAction}
        closeModal={() => setShowAction(false)}
        title={t('Tùy chọn')}
        options={[
          {
            label: t('Chỉnh sửa'),
            onPress: () => {
              router.push(`/news/add?id=${id}` as Href);
            },
            backgroundColor: '#19B1FF',
            textColor: 'white',
          },
          {
            label: t('Xóa'),
            onPress: () => {
              openModal("delete", { confirmDelete: () => deleteBlogMutation.mutate(id as string) });
              setShowAction(false);
            },
            backgroundColor: '#ef4444',
            textColor: 'white',
          }
        ]}
      />
    </View>
  )
}

export default NewsDetails