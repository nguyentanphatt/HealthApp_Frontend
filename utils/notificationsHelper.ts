import { WaterReminder } from "@/constants/type";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { convertISOToTimestamp } from "./convertISOtoTimestamp";


// Khởi tạo categories (nút action)
export async function registerCategories() {
  await Notifications.setNotificationCategoryAsync("water-reminder", [
    {
      identifier: "ADD_WATER",
      buttonTitle: "+ Thêm",
      options: { opensAppToForeground: false }, // không bật app
    },
  ]);
}

// Xin quyền notification
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  if (Device.isDevice) {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }
  return false;
}

// Lên lịch nhắc nhở theo ReminderList
export async function scheduleReminders(reminders: WaterReminder[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;
    const timestamp = convertISOToTimestamp(reminder.expiresIn.toString());
    const hour = String(new Date(timestamp).getUTCHours()).padStart(2, "0");
    const minute = String(new Date(timestamp).getUTCMinutes()).padStart(2, "0");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Đã tới giờ uống nước",
        body: reminder.message,
        categoryIdentifier: "water-reminder",
        data: { id: reminder.id, message: reminder.message, expiresIn: reminder.expiresIn },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: parseInt(hour),
        minute: parseInt(minute),
        repeats: true, // lặp hằng ngày
      },
    });
  }
}

