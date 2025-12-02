import { WaterReminder } from "@/constants/type";
import { useAppTheme } from "@/context/appThemeContext";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { scheduleReminders } from "@/utils/notificationsHelper";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import ReminderCard from "./ReminderCard";

const ReminderList = ({
  data,
}: {
  data: WaterReminder[];
}) => {
  const { theme } = useAppTheme();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const displayedData = useMemo(() => (showAll ? data : data.slice(0, 3)), [showAll, data]);
  const { t } = useTranslation();
	const hasScheduled = useRef(false);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    data.forEach((reminder) => {
      map[reminder.id] = reminder.enabled;
    });
    setEnabledMap(map);
  }, [data]);

  useEffect(() => {
    if (hasScheduled.current) return;
    hasScheduled.current = true;

    const scheduleNotifications = async () => {
      const now = Date.now();
      const validReminders = data.filter((reminder) => {
        if (!reminder.enabled) return false;
        const ts = convertISOToTimestamp(reminder.expiresIn.toString());
        return ts > now;
      });

      await scheduleReminders(validReminders);
    };

    scheduleNotifications();
  }, [data]);
  return (
    <View>
      {displayedData.map((item, index) => {
        const itemEnabled = enabledMap[item.id] ?? item.enabled;
        return (
        <TouchableOpacity
          key={index}
          disabled={!itemEnabled}
          onPress={() =>
            router.push(
              `/water/notification/edit?id=${item.id}&message=${item.message}&expiresIn=${item.expiresIn}` as Href
            )
          }
          className="mb-2.5"
        >
          <ReminderCard
            key={item.id}
            amount={item.message}
            time={item.expiresIn}
            id={item.id}
            enabled={itemEnabled}
            onToggleEnabled={(id, enabled) => {
              setEnabledMap((prev) => ({ ...prev, [id]: enabled }));
            }}
          />
        </TouchableOpacity>
      )})}

      {data.length > 3 && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} className="py-5">
          <Text className="text-lg text-center font-semibold" style={{ color: theme.colors.textSecondary }}>
            {showAll ? t("Ẩn bớt") : t("Xem thêm")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReminderList;
