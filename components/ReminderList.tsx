import { WaterReminder } from "@/constants/type";
import { convertISOToTimestamp } from "@/utils/convertTime";
import { scheduleReminders } from "@/utils/notificationsHelper";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import ReminderCard from "./ReminderCard";

const ReminderList = ({
  data,
}: {
  data: WaterReminder[];
}) => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const displayedData = showAll ? data : data.slice(0, 3);
  const { t } = useTranslation();
	const hasScheduled = useRef(false);

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

      console.log("water reminders to schedule: ", validReminders);
      await scheduleReminders(validReminders);
    };

    scheduleNotifications();
  }, [data]);
  return (
    <View>
      {displayedData.map((item, index) => (
        <TouchableOpacity
          key={index}
          disabled={!item.enabled}
          onPress={() =>
            router.push(
              `/water/notification/edit?id=${item.id}&message=${item.message}&expiresIn=${item.expiresIn}` as Href
            )
          }
          className="mb-2.5"
        >
          <ReminderCard key={item.id} amount={item.message} time={item.expiresIn} id={item.id} enabled={item.enabled} />
        </TouchableOpacity>
      ))}

      {data.length > 3 && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} className="py-5">
          <Text className="text-lg text-center text-black/60 font-semibold">
            {showAll ? t("Ẩn bớt") : t("Xem thêm")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReminderList;
