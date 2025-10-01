import ActionModal from "@/components/ActionModal";
import CalendarSwiper from "@/components/CalendarSwiper";
import Card from "@/components/Card";
import FunctionCard from "@/components/FunctionCard";
import ProgressItem from "@/components/ProgressItem";
import WaterVector from "@/components/vector/WaterVector";
import { useUnits } from "@/context/unitContext";
import { getAllActivities } from "@/services/activity";
import { getFoodStatus } from "@/services/food";
import { getSleepStatus } from "@/services/sleep";
import { getWaterStatus } from "@/services/water";
import { formatDistance } from "@/utils/activityHelper";
import { convertWater } from "@/utils/convertMeasure";
import { convertTimestampVNtoTimestamp, formatDateTimeRange } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Href, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from "react-native";
import { tv } from "tailwind-variants";
const HEADER_HEIGHT = 100;
const CALENDAR_HEIGHT = 140;

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [bgActive, setBgActive] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();
  const { units } = useUnits()
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  
  const {
    data: activityData,
    isLoading: loadingActivityData,
    refetch: refetchActivityData,
  } = useQuery({
    queryKey: ["activityData"],
    queryFn: () =>
      getAllActivities(),
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data
  });


  const filteredActivityData = activityData?.filter((activity: any) => {
    if(selectedDate === 0) return true;  
    const selectedDateUTC = new Date(convertTimestampVNtoTimestamp(selectedDate * 1000));
    const activityDateUTC = new Date(activity.startTime);
    
    const activityDateString = activityDateUTC.toDateString();
    const selectedDateString = selectedDateUTC.toDateString();
    
    return activityDateString === selectedDateString;
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
  }, []);

  const {
    data: waterStatus,
    isLoading: loadingWaterStatus,
    refetch: refetchWaterStatus,
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

  useEffect(() => {
    const fetchSessionId = async () => {
      const sessionId = await AsyncStorage.getItem('activity_session_id');
      if (sessionId) {
        setSessionId(sessionId);
      }
    };
    fetchSessionId();
  }, []);

  // Set selectedDate to current date if it's 0
  useEffect(() => {
    if (selectedDate === 0) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      setSelectedDate(currentTimestamp);
    }
  }, [selectedDate]);

  const handleActivity = () => {
    if(sessionId){
      setOpenModal(true);
    } else {
      router.push('/activity' as Href);
    }
  }

  const handleCancelActivity = () => {
    setOpenModal(false);
    AsyncStorage.removeItem('activity_session_id');
    setSessionId("");
  }

  const card = tv({
    base: "flex-1 bg-white mr-1 rounded-md p-4 shadow-md",
    variants: {
      type: {
        left: "mr-1",
        "right-top": "ml-1 mb-1",
        "right-bottom": "ml-1 mt-1",
      },
    },
  });

  const loading = loadingActivityData
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  
  return (
    <View className="flex-1 px-4 font-lato-regular">
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: 40,
        }}
        stickyHeaderIndices={[0]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={[
            bgActive && { backgroundColor: "#f6f6f6" },
            { paddingTop: 40 },
            { zIndex: 10 },
          ]}
        >
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
        </Animated.View>

        <View className="flex-1 gap-2.5">
          <Card title={t("Mục tiêu tuần")} setting icon="ellipsis-vertical">
            <TouchableOpacity className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
              <Text className="text-white">{t("Đặt mục tiêu")}</Text>
            </TouchableOpacity>
          </Card>

          <Card title={t("Hoạt động hôm nay")}>
            <View className="flex flex-col gap-3">
              <ProgressItem
                color="#00FF55"
                index={0}
                unit={t("phút")}
                icon="clock"
              />
              <ProgressItem
                color="#00D4FF"
                index={0}
                unit={t("bước")}
                icon="person-running"
              />
              <ProgressItem color="#FFF200" index={0} unit="kcal" icon="bolt" />
            </View>
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
              <Text className="text-black/60 text-xl h-[30px]">
                <Text className="font-bold text-3xl text-black">
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
                  <Text className="text-white">{t("Chọn thời gian")}</Text>
                </TouchableOpacity>
              </FunctionCard>
              <FunctionCard
                classname={card({ type: "right-bottom" })}
                iconName="bowl-food"
                title={t("Thức ăn")}
                href={`/food?selectedDate=${selectedDate}`}
              >
                <TouchableOpacity onPress={() => router.push(`/food?selectedDate=${selectedDate}`)} className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
                  <Text className="text-white">{t("Nhập số liệu")}</Text>
                </TouchableOpacity>
              </FunctionCard>
            </View>
          </View>

          <TouchableOpacity onPress={() => handleActivity()} className="flex-1 flex-row p-4 items-center justify-between bg-white shadow-md rounded-md">
            <View className="size-20 rounded-full bg-black/20 flex items-center justify-center">
              <FontAwesome6 name="person-running" size={28} color="black" />
            </View>
            <Text className="text-2xl font-bold">{t("Vận động")}</Text>
            <View className="size-20 rounded-full bg-black/20 flex items-center justify-center">
              <FontAwesome6 name="angles-right" size={28} color="black" />
            </View>
          </TouchableOpacity>
          {filteredActivityData.length > 0 && (
            <Text className="text-xl text-black/60 text-center">{t("Buổi tập hôm nay")}</Text>
          )}
          {displayedActivityData.map((activity: any, index: number) => (
            <TouchableOpacity key={activity.sessionId || index} onPress={() => router.push(`/activity/history/${activity.sessionId}` as Href)} className="flex-1 flex-col p-4 items-center gap-2 bg-white shadow-md rounded-md">
              <Text className="text-xl text-black/60">{formatDateTimeRange(activity.startTime, activity.endTime)}</Text>
              <Text className="text-2xl font-bold">{formatDistance(activity.distanceKm)}</Text>
              <View className="flex-row gap-4 mt-2">
                <Text className="text-sm text-black/60">{t("Bước")}: {activity.stepCount || 0}</Text>
                <Text className="text-sm text-black/60">Kcal: {activity.kcal || 0}</Text>
                <Text className="text-sm text-black/60">{t("Tốc độ TB")}: {activity.avgSpeed || 0} km/h</Text>
              </View>
            </TouchableOpacity>
          ))}

{filteredActivityData.length > 3 && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} className="py-5 items-center">
          <Text className="text-lg text-center text-black/60 font-semibold">
            {showAll ? t("Ẩn bớt") : t("Xem thêm")}
          </Text>
        </TouchableOpacity>
      )}
          
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          opacity: scrollY.interpolate({
            inputRange: [0, HEADER_HEIGHT],
            outputRange: [1, 0],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, HEADER_HEIGHT],
                outputRange: [0, -20],
                extrapolate: "clamp",
              }),
            },
          ],
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <Text className="text-3xl font-bold">HealthCare</Text>
      </Animated.View>
      <ActionModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        title={t("Bạn có buổi tập tạm dừng, bạn có muốn tiếp tục tập ?")}
        options={[
          { label: t("Hủy buổi tập"), onPress: handleCancelActivity },
          { label: t("Tiếp tục"), onPress: () => router.push('/activity' as Href) },
        ]}
      />
    </View>
  );
}
