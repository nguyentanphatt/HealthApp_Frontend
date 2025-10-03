import ScheduleItem from "@/components/ScheduleItem";
import { images } from "@/constants/image";
import { useUserStore } from "@/stores/useUserStore";
import { FontAwesome6 } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";


const Profile = () => {
  const { t } = useTranslation();
  const user = useUserStore(state => state.user)
  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 py-16 font-lato-regular bg-[#f6f6f6]"
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex flex-row items-center justify-between">
        <View className="size-[24px]" />
        <Text className="text-3xl font-bold text-center py-5">
          {t("Thông tin của bạn")}
        </Text>
        <TouchableOpacity onPress={() => (router.push('/user/setting' as Href))} className="w-[30px]">
          <FontAwesome6 name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex gap-6">
        <View className="w-[100px] h-[100px] bg-black/20 rounded-full self-center flex items-center justify-center overflow-hidden">
          {user?.imageUrl ? (
            <Image 
              source={{ uri: user.imageUrl }} 
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Image 
              source={images.noImg} 
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          )}
        </View>

        <View className="flex items-center justify-center w-full p-4 bg-white rounded-md shadow-md">
          <Text className="text-xl">{user?.fullName}</Text>
        </View>

        <View className="bg-white rounded-md shadow-md p-4 flex gap-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-bold text-xl">{t("Báo cáo hàng tuần")}</Text>
              <Text className="text-black/60">{t("08/08 - 10/08 tháng 8")}</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={24} color="black" />
          </View>

          <View className="flex-row justify-between h-auto">
            <View className="flex gap-2.5 max-w-[40%]">
              <ScheduleItem
                title={t("Tổng thời gian tập luyện")}
                current="00:20:20"
                old="00:10:00"
                icon="chevron-up"
                iconColor="green"
              />
              <ScheduleItem
                title={t("Tổng thời gian ngủ trung bình")}
                current="7h45m"
                old="5h50m"
                icon="chevron-up"
                iconColor="green"
              />
            </View>
            <View className="h-full w-1 bg-black/20" />
            <View className="flex gap-2.5 max-w-[40%]">
              <ScheduleItem
                title={t("Tổng số bước chân trung bình")}
                current="2000"
                old="3000"
                icon="chevron-down"
                iconColor="red"
              />
              <ScheduleItem
                title={t("Lượng nuớc uống trung bình")}
                current="2200ml"
                old="2200ml"
                icon="chevron-right"
                iconColor="orange"
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;
