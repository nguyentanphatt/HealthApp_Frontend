import { useAppTheme } from "@/context/appThemeContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Text, View } from "react-native";
type TimePickerProps = {
  initialHour?: number;
  initialMinute?: number;
  onChange: (hour: number, minute: number) => void;
};

const TimeWheelPicker = ({
  initialHour = 0,
  initialMinute = 0,
  onChange,
}: TimePickerProps) => {
  const { theme } = useAppTheme();

  const hours = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        label: i.toString().padStart(2, "0"),
        value: i,
      })),
    []
  );
  const minutes = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        label: i.toString().padStart(2, "0"),
        value: i,
      })),
    []
  );

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [selectedHourIndex, setSelectedHourIndex] = useState(initialHour);
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(initialMinute);
  console.log(selectedHourIndex, selectedMinuteIndex);
  
  const hoursRef = useRef<FlatList<{ label: string; value: number }>>(null);
  const minutesRef = useRef<FlatList<{ label: string; value: number }>>(null);

  const CONTAINER_HEIGHT = 240;
  const ITEM_HEIGHT = 48;
  const SIDE_WIDTH = 150;
  const verticalPadding = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const scrollToInitial = () => {
    hoursRef.current?.scrollToIndex({
      index: initialHour,
      animated: false,
    });
    minutesRef.current?.scrollToIndex({
      index: initialMinute,
      animated: false,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToInitial();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const onEndDragHour = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(rawIndex, hours.length - 1));
    const value = hours[clampedIndex]?.value ?? 0;
    if (hoursRef.current) {
      hoursRef.current.scrollToIndex({ index: clampedIndex, animated: true });
    }
    setSelectedHourIndex(clampedIndex);
    setHour(value);
    onChange(value, minute);
  };

  const onEndDragMinute = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(rawIndex, minutes.length - 1));
    const value = minutes[clampedIndex]?.value ?? 0;
    if (minutesRef.current) {
      minutesRef.current.scrollToIndex({ index: clampedIndex, animated: true });
    }
    setSelectedMinuteIndex(clampedIndex);
    setMinute(value);
    onChange(hour, value);
  };

  return (
    <View className="flex-row items-center justify-center mb-4">
      <View
        style={{
          width: SIDE_WIDTH,
          height: CONTAINER_HEIGHT,
          backgroundColor: theme.colors.card,
        }}
      >
        <FlatList
          ref={hoursRef}
          data={hours}
          keyExtractor={(_, index) => `h-${index}`}
          renderItem={({ item, index }) => (
            <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: index === selectedHourIndex ? "600" : "500",
                  color: theme.colors.textPrimary,
                  opacity: index === selectedHourIndex ? 1 : 0.35,
                }}
              >
                {item.label}
              </Text>
            </View>
          )}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingTop: verticalPadding, paddingBottom: verticalPadding }}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
            const clamped = Math.max(0, Math.min(idx, hours.length - 1));
            if (clamped !== selectedHourIndex) setSelectedHourIndex(clamped);
          }}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onEndDragHour}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            borderColor: theme.colors.border,
            borderWidth: 0,
          }}
        />
      </View>

      <Text style={{ fontSize: 32, fontWeight: "600", marginHorizontal: 8, color: theme.colors.textPrimary }}>
        :
      </Text>

      <View
        style={{
          width: SIDE_WIDTH,
          height: CONTAINER_HEIGHT,
          backgroundColor: theme.colors.card,
        }}
      >
        <FlatList
          ref={minutesRef}
          data={minutes}
          keyExtractor={(_, index) => `m-${index}`}
          renderItem={({ item, index }) => (
            <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: index === selectedMinuteIndex ? "600" : "500",
                  color: theme.colors.textPrimary,
                  opacity: index === selectedMinuteIndex ? 1 : 0.35,
                }}
              >
                {item.label}
              </Text>
            </View>
          )}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingTop: verticalPadding, paddingBottom: verticalPadding }}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
            const clamped = Math.max(0, Math.min(idx, minutes.length - 1));
            if (clamped !== selectedMinuteIndex) setSelectedMinuteIndex(clamped);
          }}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onEndDragMinute}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            borderColor: theme.colors.border,
            borderWidth: 0,
          }}
        />
      </View>
    </View>
  );
};

export default TimeWheelPicker;