import ActivityCard from "@/components/ActivityCard";
import CalendarSwiper from "@/components/CalendarSwiper";
import Card from "@/components/Card";
import FunctionCard from "@/components/FunctionCard";
import ProgressItem from "@/components/ProgressItem";
import WaterVector from "@/components/vector/WaterVector";
import WeeklyGoalItem from "@/components/WeeklyGoalItem";
import { Activity } from "@/constants/type";
import { useAppTheme } from "@/context/appThemeContext";
import { useUnits as useUnitsContext } from "@/context/unitContext";
import { useUnits } from "@/hooks/useUnits";
import { getAllActivities } from "@/services/activity";
import { getFoodStatus } from "@/services/food";
import { getSleepStatus } from "@/services/sleep";
import { weeklyReport, workoutDaily } from "@/services/statistics";
import { getUserProfile, getWeeklyGoal } from "@/services/user";
import { getWaterStatus } from "@/services/water";
import { getWorkoutVideo } from "@/services/workout";
import { useModalStore } from "@/stores/useModalStore";
import { useUserStore } from "@/stores/useUserStore";
import { convertWater } from "@/utils/convertMeasure";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Href, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { tv } from "tailwind-variants";

dayjs.extend(isoWeek);

export default function HomeScreen() {
  const setUser = useUserStore(state => state.setUser)
  const { units } = useUnits()
  const { setUnit } = useUnitsContext()
  const { openModal } = useModalStore();
  const { closeModal } = useModalStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [bgActive, setBgActive] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadTempLanguage = async () => {
      try {
        const tempLang = await AsyncStorage.getItem('temp_language');
        if (tempLang === 'en' || tempLang === 'vi') {
          setUnit('language', tempLang);
          await AsyncStorage.removeItem('temp_language');
        }
      } catch (error) {
        console.error('Error loading temp language:', error);
      }
    };
    loadTempLanguage();
  }, [setUnit]);

  const {
    data: activityData,
    isLoading: loadingActivityData,
  } = useQuery({
    queryKey: ["activityData"],
    queryFn: () =>
      getAllActivities(),
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data
  });

  const weekStart = selectedDate !== 0
    ? dayjs.unix(selectedDate).startOf('isoWeek')
    : dayjs().startOf('isoWeek');
  const weekKey = weekStart.valueOf();

  const {
    data: weeklyGoal,
    isLoading: loadingWeeklyGoal,
  } = useQuery({
    queryKey: ["weeklyGoal", weekKey],
    queryFn: () =>
      getWeeklyGoal(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data,
  });

  const { data: workoutDailyData, isLoading: loadingWorkoutDailyData } = useQuery({
    queryKey: ["workoutDailyData", selectedDate],
    queryFn: () => workoutDaily({ date: selectedDate ? selectedDate * 1000 : undefined }),
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data,
  });


  const filteredActivityData = activityData?.filter((activity: any) => {
    if (selectedDate === 0) return true;
    const VN_OFFSET = 7 * 60 * 60 * 1000;
    const toVnDateKey = (ms: number) => new Date(ms + VN_OFFSET).toISOString().slice(0, 10);

    const selectedKey = toVnDateKey(selectedDate * 1000);
    const activityKey = toVnDateKey(new Date(activity.startTime).getTime());

    return activityKey === selectedKey;
  }) || [];

  const displayedActivityData = showAll ? filteredActivityData : filteredActivityData.slice(0, 3);

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["waterStatus", 0],
      queryFn: () => getWaterStatus(),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["foodStatus", 0],
      queryFn: () => getFoodStatus(),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["sleepStatus", 0],
      queryFn: () => getSleepStatus(),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["activityData"],
      queryFn: () => getAllActivities(),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["videos"],
      queryFn: () => getWorkoutVideo({ page: 1, limit: 6 }),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["reportData"],
      queryFn: () => weeklyReport(),
      staleTime: 1000 * 60 * 5,
    });
  }, []);

  const {
    data: waterStatus,
  } = useQuery({
    queryKey: ["waterStatus", selectedDate],
    queryFn: () =>
      getWaterStatus(
        selectedDate !== 0
          ? { date: (selectedDate * 1000).toString() }
          : undefined
      ),
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data
  });

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value >= 20 && !bgActive) setBgActive(true);
      if (value < 20 && bgActive) setBgActive(false);
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, bgActive]);

  const userProfileMutation = useMutation({
    mutationFn: async () => {
      return await getUserProfile()
    },
    onSuccess: (response) => {
      setUser(response)
    }
  })

  useEffect(() => {
    const fetchSessionId = async () => {
      const sessionId = await AsyncStorage.getItem('activity_session_id');
      if (sessionId) {
        setSessionId(sessionId);
      }
    };
    fetchSessionId();
    userProfileMutation.mutate()
  }, []);

  useEffect(() => {
    if (selectedDate === 0) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      setSelectedDate(currentTimestamp);
    }
  }, [selectedDate]);

  const handleActivity = () => {
    if (sessionId) {
      openModal("action", {
        title: t("Bạn có buổi tập tạm dừng, bạn có muốn tiếp tục tập ?"),
        options: [
          { label: t("Hủy buổi tập"), onPress: handleCancelActivity },
          { label: t("Tiếp tục"), onPress: () => router.push('/activity' as Href) },
        ]
      });
    } else {
      router.push('/activity' as Href);
    }
  }

  const handleCancelActivity = () => {
    closeModal();
    AsyncStorage.removeItem('activity_session_id');
    setSessionId("");
  }

  const card = tv({
    base: "flex-1 mr-1 rounded-md p-4 shadow-md bg-white",
    variants: {
      type: {
        left: "mr-1",
        "right-top": "ml-1 mb-1",
        "right-bottom": "ml-1 mt-1",
      },
    },
  });

  return (
    <View className="flex-1 font-lato-regular">
      <View className="pt-16 px-4" style={{ backgroundColor: theme.colors.background }}>
        <CalendarSwiper
          selectedDate={
            selectedDate
              ? dayjs.unix(selectedDate).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD")
          }
          onDateChange={(date, timestamp) => {
            setSelectedDate(Number((timestamp / 1000).toFixed(0)));
          }}
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 gap-2.5 px-4" style={{ backgroundColor: theme.colors.background }}>
          <Card title={t("Mục tiêu tuần")}
          >
            {loadingWeeklyGoal ? <>
              <View className="h-[140px] flex items-center justify-center">
                <ActivityIndicator size="large" color={theme.colors.textPrimary} />
              </View>
            </> : <>
              <View className="flex flex-row items-start justify-between h-[140px]">
                <View className="max-w-[50%] flex items-start justify-start gap-4">
                  <WeeklyGoalItem
                    icon="glass-water-droplet"
                    iconColor="#19B1FF"
                    currentIntake={convertWater(weeklyGoal?.current.waterDaily ?? 0, units.water)}
                    goalIntake={convertWater(weeklyGoal?.targets.waterDaily ?? 0, units.water)}
                    unit={units.water}
                  />

                  <WeeklyGoalItem
                    icon="bed"
                    iconColor="#FF66F5"
                    currentIntake={weeklyGoal?.current.sleep ?? 0}
                    goalIntake={weeklyGoal?.targets.sleep ?? 0}
                    unit={t("giờ")}
                  />

                  <WeeklyGoalItem
                    icon="bowl-food"
                    iconColor="#FFAE00"
                    currentIntake={weeklyGoal?.current.calories ?? 0}
                    goalIntake={weeklyGoal?.targets.calories ?? 0}
                    unit={t("kcal")}
                  />

                </View>
                <View className="max-w-[50%] flex items-start justify-start gap-4">
                  <WeeklyGoalItem
                    icon="clock"
                    iconColor="#06F86F"
                    currentIntake={weeklyGoal?.current.work ?? 0}
                    goalIntake={weeklyGoal?.targets.work ?? 0}
                    unit={t("giờ")}
                  />

                  <WeeklyGoalItem
                    icon="person-running"
                    iconColor="#FF0000"
                    currentIntake={weeklyGoal?.current.steps ?? 0}
                    goalIntake={weeklyGoal?.targets.steps ?? 0}
                    unit={t("bước")}
                  />
                </View>
              </View>
            </>}
          </Card>

          <Card title={t("Hoạt động hôm nay")}>
            {loadingWorkoutDailyData ?
              <View className="h-[110px] flex items-center justify-center">
                <ActivityIndicator size="large" color={theme.colors.textPrimary} />
              </View> : <>
                <View className="flex flex-col gap-3 h-[110px]">
                  <ProgressItem
                    color="#00FF55"
                    index={Number(workoutDailyData?.workoutMinutes.toFixed(0) ?? 0)}
                    unit={t("phút")}
                    icon="clock"
                  />
                  <ProgressItem
                    color="#00D4FF"
                    index={workoutDailyData?.steps ?? 0}
                    unit={t("bước")}
                    icon="person-running"
                  />
                  <ProgressItem color="#FFF200" index={workoutDailyData?.calories ?? 0} unit="kcal" icon="bolt" />
                </View>
              </>
            }
          </Card>

          {sessionId && (
            <TouchableOpacity onPress={() => router.push('/activity' as Href)} className="flex p-4 items-center justify-between bg-white shadow-md rounded-md">
              <Text className="text-xl text-black/60">{t("Bạn đang có buổi tập tạm dừng")}</Text>
              <Text className="text-2xl font-bold">{t("Tiếp tục tập")}</Text>
            </TouchableOpacity>
          )}

          <View className="flex-row">
            <FunctionCard
              classname={card({ type: "left" })}
              iconName="glass-water-droplet"
              title={t("Nước")}
              href={`/water?selectedDate=${selectedDate}`}
            >
              <WaterVector
                progress={
                  waterStatus
                    ? (waterStatus.currentIntake / waterStatus.dailyGoal) * 100
                    : 0
                }
                animated={true}
              />
              <Text className="text-xl h-[30px]" style={{ color: theme.colors.textSecondary }}>
                <Text className="font-bold text-3xl" style={{ color: theme.colors.textPrimary }}>
                  {convertWater(waterStatus?.currentIntake ?? 0, units.water)}
                </Text>
                / {convertWater(waterStatus?.dailyGoal ?? 0, units.water)} {units.water}
              </Text>
            </FunctionCard>
            <View className="flex-1 justify-between">
              <FunctionCard
                classname={card({ type: "right-top" })}
                iconName="bed"
                title={t("Giấc ngủ")}
                href={`/sleep?selectedDate=${selectedDate}`}
              >
                <TouchableOpacity onPress={() => router.push(`/sleep?selectedDate=${selectedDate}`)} className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
                  <Text className="" style={{ color: theme.mode === "dark" ? theme.colors.textPrimary : "#fff" }}>{t("Chọn thời gian")}</Text>
                </TouchableOpacity>
              </FunctionCard>
              <FunctionCard
                classname={card({ type: "right-bottom" })}
                iconName="bowl-food"
                title={t("Thức ăn")}
                href={`/food?selectedDate=${selectedDate}`}
              >
                <TouchableOpacity onPress={() => router.push(`/food?selectedDate=${selectedDate}`)} className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
                  <Text className="" style={{ color: theme.mode === "dark" ? theme.colors.textPrimary : "#fff" }}>{t("Nhập số liệu")}</Text>
                </TouchableOpacity>
              </FunctionCard>
            </View>
          </View>

          <TouchableOpacity onPress={() => handleActivity()} className="flex-1 flex-row p-4 items-center justify-between rounded-md" style={{ backgroundColor: theme.colors.card }}>
            <View className="size-20 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.secondaryCard }}>
              <FontAwesome6 name="person-running" size={28} color={theme.colors.textPrimary} />
            </View>
            <Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{t("Vận động")}</Text>
            <View className="size-20 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.secondaryCard }}>
              <FontAwesome6 name="angles-right" size={28} color={theme.colors.textPrimary} />
            </View>
          </TouchableOpacity>
          {loadingActivityData ? <ActivityIndicator size="large" color={theme.colors.textPrimary} /> : <>
            {filteredActivityData.length > 0 && (
              <Text className="text-xl text-center" style={{ color: theme.colors.textSecondary }}>{t("Buổi tập hôm nay")}</Text>
            )}
            {displayedActivityData.map((activity: Activity, index: number) => (
              <ActivityCard key={activity.sessionId || index} activity={activity} index={index} />
            ))}

            {filteredActivityData.length > 3 && (
              <TouchableOpacity onPress={() => setShowAll(!showAll)} className="mb-6 items-center">
                <Text className="text-lg text-center font-semibold" style={{ color: theme.colors.textSecondary }}>
                  {showAll ? t("Ẩn bớt") : t("Xem thêm")}
                </Text>
              </TouchableOpacity>
            )}
          </>}

        </View>
      </ScrollView>


    </View>
  );
}
