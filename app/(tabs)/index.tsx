import CalendarSwiper from "@/components/CalendarSwiper";
import Card from "@/components/Card";
import FunctionCard from "@/components/FunctionCard";
import ProgressItem from "@/components/ProgressItem";
import WaterVector from "@/components/vector/WaterVector";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { tv } from "tailwind-variants";
const HEADER_HEIGHT = 100;
const CALENDAR_HEIGHT = 140;

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [bgActive, setBgActive] = useState(false);
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value >= 20 && !bgActive) setBgActive(true);
      if (value < 20 && bgActive) setBgActive(false);
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, bgActive]);

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
          ]}
        >
          <CalendarSwiper />
        </Animated.View>

        <View className="flex-1 gap-2.5">
          <Card title="Mục tiêu tuần" setting icon="ellipsis-vertical">
            <TouchableOpacity className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
              <Text className="text-white">Đặt mục tiêu</Text>
            </TouchableOpacity>
          </Card>

          <Card title="Hoạt động hôm nay">
            <View className="flex flex-col gap-3">
              <ProgressItem
                color="#00FF55"
                index={0}
                unit="phút"
                icon="clock"
              />
              <ProgressItem
                color="#00D4FF"
                index={0}
                unit="bước"
                icon="person-running"
              />
              <ProgressItem color="#FFF200" index={0} unit="kcal" icon="bolt" />
            </View>
          </Card>

          <View className="flex-row">
            <FunctionCard
              classname={card({ type: "left" })}
              iconName="glass-water-droplet"
              title="Nước"
              href="/water"
            >
              <WaterVector />
              <Text className="text-black/60 text-xl">
                <Text className="font-bold text-3xl text-black">0</Text>/ 2000ml
              </Text>
            </FunctionCard>
            <View className="flex-1 justify-between">
              <FunctionCard
                classname={card({ type: "right-top" })}
                iconName="bed"
                title="Giấc ngủ"
              >
                <TouchableOpacity className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
                  <Text className="text-white">Chọn thời gian</Text>
                </TouchableOpacity>
              </FunctionCard>
              <FunctionCard
                classname={card({ type: "right-bottom" })}
                iconName="bowl-food"
                title="Thức ăn"
              >
                <TouchableOpacity className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
                  <Text className="text-white">Nhập số liệu</Text>
                </TouchableOpacity>
              </FunctionCard>
            </View>
          </View>

          <View className="flex-1 flex-row p-4 items-center justify-between bg-white shadow-md rounded-md">
            <View className="size-20 rounded-full bg-black/20 flex items-center justify-center">
              <FontAwesome6 name="person-running" size={28} color="black" />
            </View>
            <Text className="text-2xl font-bold">Đi bộ</Text>
            <View className="size-20 rounded-full bg-black/20 flex items-center justify-center">
              <FontAwesome6 name="angles-right" size={28} color="black" />
            </View>
          </View>

          <View className="flex-1 flex-row p-4 items-center justify-between bg-white shadow-md rounded-md">
            <View className="size-20 rounded-full bg-black/20 flex items-center justify-center">
              <FontAwesome6 name="person-walking" size={28} color="black" />
            </View>
            <Text className="text-2xl font-bold">Đi bộ</Text>
            <View className="size-20 rounded-full bg-black/20 flex items-center justify-center">
              <FontAwesome6 name="angles-right" size={28} color="black" />
            </View>
          </View>
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
        }}
      >
        <Text className="text-3xl font-bold">HealthCare</Text>
      </Animated.View>
    </View>
  );
}
