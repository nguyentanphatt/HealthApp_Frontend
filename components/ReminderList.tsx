import { WaterReminder } from "@/constants/type";
import { scheduleReminders } from "@/utils/notificationsHelper";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const scheduleNotifications = async () => {
        const enabledReminders = data.filter(reminder => reminder.enabled === true);
        await scheduleReminders(enabledReminders);
    }
    scheduleNotifications()
  },[data])
  return (
    <View>
      {displayedData.map((item, index) => (
        <TouchableOpacity
          key={index}
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
            {showAll ? "Ẩn bớt" : "Xem thêm"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReminderList;
