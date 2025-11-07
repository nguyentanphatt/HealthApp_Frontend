import { useAppTheme } from "@/context/appThemeContext";
import i18n from "@/plugins/i18n";
import { convertDayToVN } from "@/utils/convertTime";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Modal, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";

type DayItem = {
  day: string;
  date: string;
  fullDate: string;
};

const ITEM_WIDTH = 60;
const ITEM_MARGIN = 6;

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  const TODAY_STR = dayjs().format("YYYY-MM-DD");

  const [endDate, setEndDate] = useState<dayjs.Dayjs>(() => {
    const initial = dayjs(localSelected);
    return initial.isAfter(dayjs()) ? dayjs() : initial;
  });

  useEffect(() => {
    const start = endDate.subtract(4, "day");
    const generated = generateDays(start, 5);
    setDays(generated);
  }, [endDate]);

  useEffect(() => {
    if (selectedDate) {
      setLocalSelected(selectedDate);
      const picked = dayjs(selectedDate);
      const today = dayjs();
      const clamped = picked.isAfter(today) ? today : picked;
      const windowEnd = endDate;
      const windowStart = endDate.subtract(4, "day");
      const isOutside = clamped.isBefore(windowStart, "day") || clamped.isAfter(windowEnd, "day");
      if (isOutside) {
        setEndDate(clamped);
      }
    }
  }, [selectedDate]);

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

  const handleSelectDate = (date: string) => {
    setLocalSelected(date);
    onDateChange?.(date, new Date(date).getTime());
  };

  const applyPickedDate = (date?: Date) => {
    if (!date) return;
    const picked = dayjs(date);
    const end = picked.isAfter(dayjs()) ? dayjs() : picked;
    const selectedStr = end.format("YYYY-MM-DD");
    setLocalSelected(selectedStr);
    setEndDate(end);
    onDateChange?.(selectedStr, end.valueOf());
  };

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const renderItem = (item: DayItem) => {
    const isSelected = item.fullDate === localSelected;
    const isFuture = dayjs(item.fullDate).isAfter(dayjs(), "day");
    return (
      <TouchableOpacity
        key={item.fullDate}
        onPress={() => !isFuture && handleSelectDate(item.fullDate)}
        style={[
          styles.item,
          { width: ITEM_WIDTH, marginHorizontal: ITEM_MARGIN },
          isSelected ? { backgroundColor: theme.colors.tint } : { backgroundColor: theme.colors.card },
          isFuture ? { opacity: 0.4 } : null,
        ]}
        activeOpacity={0.7}
        disabled={isFuture}
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 15 && Math.abs(g.dy) < 10,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 40) {
          setEndDate((prev) => prev.subtract(5, "day"));
        } else if (g.dx < -40) {
          setEndDate((prev) => {
            const candidate = prev.add(5, "day");
            const today = dayjs();
            return candidate.isAfter(today) ? today : candidate;
          });
        }
      },
    })
  ).current;

  return (
    <View
      onLayout={onContainerLayout}
      style={{
        paddingVertical: 12,
        zIndex: 20,
        elevation: 5
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary }}>
          {i18n?.language && i18n.language.startsWith("en")
            ? dayjs(localSelected).format("MMMM, YYYY")
            : "Tháng " + dayjs(localSelected).format("M YYYY")}
        </Text>
        <TouchableOpacity onPress={() => { setPickerDate(dayjs(localSelected).toDate()); setPickerOpen(true); }}>
          <FontAwesome6 name="calendar-days" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View {...panResponder.panHandlers} style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          {days.map(renderItem)}
        </View>
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "#0008", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <View style={{ width: "100%", borderRadius: 12, padding: 12, backgroundColor: theme.colors.card }}>
            <DateTimePicker
              mode="single"
              date={pickerDate}
              onChange={(params: any) => setPickerDate(params?.date ?? new Date())}
              locale={i18n.language}
              maxDate={new Date()}
              styles={{
                day_cell: { borderRadius: 20, width: 40, height: 40 },
                today: { borderColor: theme.colors.tint, borderWidth: 1 },
                selected: { backgroundColor: theme.colors.tint, borderRadius: 5 },
                selected_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#fff" },
                disabled: { opacity: 0.4 },
                disabled_label: { color: theme.colors.textSecondary },
                button_next_image: { tintColor: theme.mode === "dark" ? "#fff" : "#000" },
                button_prev_image: { tintColor: theme.mode === "dark" ? "#fff" : "#000" },
                month_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
                year_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
                year: { borderWidth: 0 },
                year_selector_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
                header: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
                month: { borderWidth: 0 },
                month_selector_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
                day_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
                today_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
                selected_month: { borderWidth: 1, borderColor: theme.colors.tint },
                selected_year: { borderWidth: 1, borderColor: theme.colors.tint },
                weekday_label: { color: theme.mode === "dark" ? theme.colors.textPrimary : "#000" },
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setPickerOpen(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: theme.colors.textSecondary }}>{i18n.t?.("Huỷ") ?? "Huỷ"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { const chosen = pickerDate ?? new Date(); setPickerOpen(false); applyPickedDate(chosen); }}
                style={{ paddingHorizontal: 12, paddingVertical: 8 }}
              >
                <Text style={{ color: theme.colors.tint, fontWeight: "700" }}>{i18n.t?.("Chọn") ?? "Chọn"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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