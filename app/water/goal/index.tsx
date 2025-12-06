import { useAppTheme } from "@/context/appThemeContext";
import { useUnits } from "@/hooks/useUnits";
import { updateWaterDailyGoal } from "@/services/water";
import { convertWater } from "@/utils/convertMeasure";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const Page = () => {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { amount, time } = useLocalSearchParams<{
    amount: string;
    time: string;
  }>();

  const { units, inputToBaseWater } = useUnits()
  const initAmount = Number(amount);
  const { t } = useTranslation();
  const initialValue =
    units.water === "ml" ? initAmount : Number(convertWater(initAmount, units.water).toFixed(2));

  const queryClient = useQueryClient()
  const timestamp = convertISOToTimestamp(time);

  const items =
    units.water === "ml"
      ? Array.from({ length: (5000 - 50) / 50 + 1 }, (_, i) => {
        const amount = 50 + i * 50;
        return { label: `${amount}`, value: amount };
      })
      : Array.from({ length: (170 - 2) / 2 + 1 }, (_, i) => {
        const amount = 2 + i * 2;
        return { label: `${amount}`, value: amount };
      });


  const initialIndex = useMemo(() => {
    const index = items.findIndex((item: { label: string; value: number }) => item.value === initialValue);
    return index >= 0 ? index : 0;
  }, [items, initialValue]);

  const [selectedAmount, setSelectedAmount] = useState<number>(initialValue);

  const handleGoBack = async (amount: number, time: string) => {
    const valueInMl = inputToBaseWater(amount);
    try {
      const response = await updateWaterDailyGoal(valueInMl, time);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["waterStatus"] });
        console.log("response", response);
        

        router.push(`/water`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const listRef = useRef<FlatList<{ label: string; value: number }>>(null);

  const CONTAINER_HEIGHT = 240;
  const ITEM_HEIGHT = 48;
  const LIST_WIDTH = 250;
  const verticalPadding = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const handleMomentumEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setSelectedAmount(items[clamped]?.value);
  };
  return (
    <View className="flex-1 gap-2.5 px-4 pt-12 h-[300px] font-lato-regular">
      <View className="flex flex-row items-center justify-between py-5">
        <TouchableOpacity
          onPress={() => handleGoBack(selectedAmount, timestamp.toString())}
        >
          <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold self-center" style={{ color: theme.colors.textPrimary }}>{t("Đặt mục tiêu")}</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text className="text-lg text-center min-h-[70px]" style={{ color: theme.colors.textSecondary }}>
        {t("Hãy luôn đặt mục tiêu uống nước mỗi ngày – vì một cơ thể khỏe mạnh bắt đầu từ những thói quen nhỏ nhất.")}
      </Text>

      <View className="flex items-center justify-center p-4 rounded-md" style={{ backgroundColor: theme.colors.card }}>
        <Text className="text-2xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
          {t("Mục tiêu lượng nước")} ({units.water})
        </Text>
        <View style={{ height: CONTAINER_HEIGHT, width: LIST_WIDTH, backgroundColor: theme.colors.card }}>
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(_, index) => `w-${index}`}
            getItemLayout={getItemLayout}
            contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
            initialNumToRender={items.length}
            maxToRenderPerBatch={items.length}
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={{ paddingTop: verticalPadding, paddingBottom: verticalPadding }}
            renderItem={({ item }) => (
              <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: item.value === selectedAmount ? '600' : '500',
                    color: theme.colors.textPrimary,
                    opacity: item.value === selectedAmount ? 1 : 0.35,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            )}
            onMomentumScrollEnd={handleMomentumEnd}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              const clamped = Math.max(0, Math.min(idx, items.length - 1));
              if (clamped !== selectedAmount) setSelectedAmount(items[clamped]?.value);
            }}
            scrollEventThrottle={16}
          />
        </View>
      </View>
    </View>
  );
};

export default Page;
