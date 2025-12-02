import StatisticWeeklyCard from "@/components/StatisticWeeklyCard";
import { images } from "@/constants/image";
import { useAppTheme } from "@/context/appThemeContext";
import { foodWeekly, sleepWeekly, waterWeekly, weeklyReport, workoutWeekly } from "@/services/statistics";
import { useUserStore } from "@/stores/useUserStore";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Href, router } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";


const Profile = () => {
  dayjs.extend(isoWeek);
  const { t } = useTranslation();
  const user = useUserStore(state => state.user)
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const { data: reportData, isLoading: isLoadingReportData } = useQuery({
    queryKey: ["reportData"],
    queryFn: () => weeklyReport(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });

  const diffs = Object.values(reportData?.difference || {});
  const numPositive = diffs.filter((item: any) => (item?.percentage ?? 0) > 0).length;
  const numNegative = diffs.filter((item: any) => (item?.percentage ?? 0) < 0).length;
  const improve = numPositive > numNegative;

  useEffect(() => {
    const weekStartMs = dayjs().startOf('isoWeek').valueOf();
    queryClient.prefetchQuery({
      queryKey: ["foodWeeklyData", weekStartMs],
      queryFn: () => foodWeekly({ date: weekStartMs })
    });
    queryClient.prefetchQuery({
      queryKey: ["sleepWeeklyData", weekStartMs],
      queryFn: () => sleepWeekly({ date: weekStartMs })
    });
    queryClient.prefetchQuery({
      queryKey: ["workoutWeeklyData", weekStartMs],
      queryFn: () => workoutWeekly({ date: weekStartMs })
    });
    queryClient.prefetchQuery({
      queryKey: ["waterWeeklyData", weekStartMs],
      queryFn: () => waterWeekly({ date: weekStartMs })
    });
  }, [queryClient]);
  
  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 py-16 font-lato-regular"
      style={{ backgroundColor: theme.colors.background }}
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex flex-row items-center justify-between">
        <View className="size-[24px]" />
        <Text className="text-3xl font-bold text-center py-5" style={{ color: theme.colors.textPrimary }}>
          {t("Thông tin của bạn")}
        </Text>
        <TouchableOpacity onPress={() => (router.push('/user/setting' as Href))} className="w-[30px]">
          <FontAwesome6 name="ellipsis-vertical" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View className="flex gap-6">
        <View className="w-[100px] h-[100px] rounded-full self-center flex items-center justify-center overflow-hidden" style={{ backgroundColor: theme.colors.card }}>
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

        <View className="flex items-center justify-center w-full p-4 rounded-md shadow-md" style={{ backgroundColor: theme.colors.card }}>
          <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{user?.fullName}</Text>
        </View>

        {isLoadingReportData ? (
          <View className="flex items-center justify-center w-full">
            <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{t("Đang tải dữ liệu...")}</Text>
          </View>
        ) : (
          <>
            <StatisticWeeklyCard data={reportData} />

            {improve ? (
              <Text className="text-lg text-center" style={{ color: theme.colors.textPrimary }}>{t("Tuần vừa qua bạn đã cải thiện tốt hơn")}</Text>
            ) : (
              <Text className="text-lg text-center" style={{ color: theme.colors.textPrimary }}>{t("Hãy cố gắng cải thiện hơn nữa")}</Text>
            )}
          </>
        )}


      </View>
    </ScrollView>
  );
};

export default Profile;
