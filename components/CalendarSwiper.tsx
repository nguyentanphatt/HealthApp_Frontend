import { useAppTheme } from "@/context/appThemeContext";
import i18n from "@/plugins/i18n";
import { convertDayToVN } from "@/utils/convertTime";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DayItem = {
  day: string;
  date: string;
  fullDate: string;
};

const ITEM_WIDTH = 60;
const ITEM_MARGIN = 6;
const ITEM_TOTAL = ITEM_WIDTH + ITEM_MARGIN * 2;

export default function CalendarSwiper({
  onDateChange,
  selectedDate,
}: {
  onDateChange?: (date: string, timestamp: number) => void;
  selectedDate?: string;
}) {
  const { theme } = useAppTheme();
  const [days, setDays] = useState<DayItem[]>([]);
  const [localSelected, setLocalSelected] = useState<string>(
    selectedDate ?? dayjs().format("YYYY-MM-DD")
  );
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const listRef = useRef<FlatList<DayItem> | null>(null);
  const earliestDate = useRef(dayjs());
  const initialScrollDone = useRef(false);

  useEffect(() => {
    const today = dayjs();
    const start = today.subtract(90, "day");
    const initialDays = generateDays(start, 91);
    setDays(initialDays);
    earliestDate.current = start;
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setLocalSelected(selectedDate);
    }
  }, [selectedDate, days, containerWidth]);

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
    const newStart = earliestDate.current.subtract(90, "day");
    const newDays = generateDays(newStart, 90);

    setDays((prev) => [...newDays, ...prev]);
    earliestDate.current = newStart;

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: ITEM_TOTAL * newDays.length,
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
    setLocalSelected(date);
    onDateChange?.(date, new Date(date).getTime());
  };

  useEffect(() => {
    if (days.length > 0 && containerWidth > 0 && !initialScrollDone.current) {
      const lastIndex = days.length - 1;
      const offset = Math.max(0, (lastIndex + 1) * ITEM_TOTAL - containerWidth);
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset, animated: false });
        initialScrollDone.current = true;
      });
    }
  }, [days, containerWidth]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const renderItem: ListRenderItem<DayItem> = ({ item }) => {
    const isSelected = item.fullDate === localSelected;
    return (
      <TouchableOpacity
        onPress={() => handleSelectDate(item.fullDate)}
        style={[
          styles.item,
          { width: ITEM_WIDTH, marginHorizontal: ITEM_MARGIN },
          isSelected ? { backgroundColor: theme.colors.tint } : { backgroundColor: theme.colors.card },
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayText,
            isSelected
              ? { color: theme.mode === "dark" ? theme.colors.textPrimary : "#fff" }
              : { color: theme.colors.textSecondary },
          ]}
        >
          {item.day}
        </Text>
        <Text
          style={[
            styles.dateText,
            isSelected
              ? { color: theme.mode === "dark" ? theme.colors.textPrimary : "#fff" }
              : { color: theme.colors.textSecondary },
          ]}
        >
          {item.date}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      onLayout={onContainerLayout}
      style={{
        paddingVertical: 12,
        zIndex: 20,
        elevation: 5
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
        {i18n?.language && i18n.language.startsWith("en")
          ? dayjs(localSelected).format("MMMM, YYYY")
          : "Tháng " + dayjs(localSelected).format("M YYYY")}
      </Text>

      <FlatList
        ref={listRef}
        horizontal
        data={days}
        keyExtractor={(item) => item.fullDate}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: ITEM_TOTAL,
          offset: ITEM_TOTAL * index,
          index,
        })}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        extraData={localSelected}
        contentContainerStyle={{ paddingRight: ITEM_MARGIN }}
        pointerEvents="auto"
        removeClippedSubviews={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    height: 64,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemSelected: {
    backgroundColor: "#00BFFF",
  },
  itemUnselected: {
    backgroundColor: "#E6E6E6",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 14,
  },
  textWhite: {
    color: "#fff",
  },
  textBlack: {
    color: "#000",
  },
});
