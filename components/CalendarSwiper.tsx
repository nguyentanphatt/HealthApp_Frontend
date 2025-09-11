import { convertDayToVN } from "@/utils/convertDayToVN";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DayItem = {
  day: string;
  date: string;
  fullDate: string;
};

const ITEM_WIDTH = 70;

export default function CalendarSwiper({
  onDateChange,
  selectedDate,
}: {
  onDateChange?: (date: string, timestamp: number) => void;
  selectedDate?: string;
}) {
  const [days, setDays] = useState<DayItem[]>([]);
  const listRef = useRef<FlatList<DayItem>>(null);
  const earliestDate = useRef(dayjs());

  useEffect(() => {
    const today = dayjs();
    const start = today.subtract(30, "day");
    const initialDays = generateDays(start, 31);
    setDays(initialDays);
    earliestDate.current = start;
  }, []);

  const generateDays = (start: dayjs.Dayjs, count: number): DayItem[] => {
    return Array.from({ length: count }).map((_, i) => {
      const dateObj = start.add(i, "day");
      return {
        day: convertDayToVN(dateObj.format("dd")),
        date: dateObj.format("D"),
        fullDate: dateObj.format("YYYY-MM-DD"),
      };
    });
  };

  const prependDays = useCallback(() => {
    const newStart = earliestDate.current.subtract(30, "day");
    const newDays = generateDays(newStart, 30);
    setDays((prev) => [...newDays, ...prev]);
    earliestDate.current = newStart;

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: ITEM_WIDTH * newDays.length,
        animated: false,
      });
    });
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    if (offsetX < 100) {
      prependDays();
    }
  };

  const handleSelectDate = (date: string) => {
    if (onDateChange) {
      onDateChange(date, new Date(date).getTime());
    }
  };

  const renderItem: ListRenderItem<DayItem> = ({ item }) => {
    const isSelected = item.fullDate === selectedDate;

    return (
      <TouchableOpacity
        onPress={() => handleSelectDate(item.fullDate)}
        className={`mx-1 size-16 flex items-center justify-center rounded-lg ${
          isSelected ? "bg-cyan-blue" : "bg-gray-300"
        }`}
      >
        <Text
          className={`text-center font-bold ${
            isSelected ? "text-white" : "text-black"
          }`}
        >
          {item.day}
        </Text>
        <Text
          className={`text-center ${isSelected ? "text-white" : "text-black"}`}
        >
          {item.date}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="py-4">
      <Text className="text-lg font-bold mb-2">
        {"Tháng " + dayjs(selectedDate).format("M YYYY")}
      </Text>

      <FlatList
        ref={listRef}
        horizontal
        data={days}
        keyExtractor={(item) => item.fullDate}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        onContentSizeChange={() => {
          if (days.length > 0) {
            listRef.current?.scrollToEnd({ animated: false });
          }
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        extraData={selectedDate}
      />
    </View>
  );
}
