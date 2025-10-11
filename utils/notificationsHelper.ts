import { WaterReminder } from "@/constants/type";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { convertISOToTimestamp } from "./convertTime";


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
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowList: true,
        shouldShowBanner: true
      }),
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
  console.log("Gọi scheduleReminders với reminders:", reminders);
  // XÓA DÒNG NÀY (KHÔNG ĐĂNG KÝ LISTENER Ở ĐÂY)
  // Notifications.addNotificationReceivedListener(notification => {
  //   console.log("Notification received:", notification);
  // });

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;
    try {
      const timestamp = convertISOToTimestamp(reminder.expiresIn.toString());
      const hour = String(new Date(timestamp).getHours()).padStart(2, "0");
      const minute = String(new Date(timestamp).getMinutes()).padStart(2, "0");
      console.log("reminder " + hour + " " + minute + " " + reminder.expiresIn);
      const now = Date.now();
      let delaySeconds = Math.floor((timestamp - now) / 1000);
      if (delaySeconds < 0) delaySeconds += 24 * 3600;
      console.log("Scheduling in", delaySeconds, "seconds");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Đã tới giờ uống nước",
          body: "Bạn sẽ cần uống " + reminder.message + "ml vào lúc này !",
          categoryIdentifier: "water-reminder",
          data: { id: reminder.id, message: reminder.message, expiresIn: reminder.expiresIn },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
          channelId: "default",
        },
      });
    } catch (e) {
      console.error("Error scheduling reminder:", e);
    }
  }
}

