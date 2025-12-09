import { WaterReminder } from "@/constants/type";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { convertISOToTimestamp } from "./convertTime";

export async function registerCategories() {
  await Notifications.setNotificationCategoryAsync("water-reminder", [
    {
      identifier: "ADD_WATER",
      buttonTitle: "+ Thêm",
      options: { opensAppToForeground: false },
    },
  ]);
}

export async function registerForPushNotificationsAsync() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("sleep-reminder", {
      name: "Sleep Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#19B1FF",
    });
  }

  if (Device.isDevice) {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log(`[Notifications] Permission status: ${status}`);
    return status === "granted";
  }
  return false;
}


export async function scheduleReminders(reminders: WaterReminder[]) {
  console.log("Gọi scheduleReminders với reminders:", reminders);

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

export async function scheduleSleepNotification(sleepStartTime: string, wakeUpTime: string) {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.categoryIdentifier === "sleep-reminder") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    const [sleepHour, sleepMinute] = sleepStartTime.split(":").map(Number);
    const now = new Date();

    console.log(`[Sleep Notification] Current time: ${now.toLocaleString('vi-VN')}`);
    console.log(`[Sleep Notification] Sleep time: ${sleepStartTime}, Wake time: ${wakeUpTime}`);

    const scheduledTime = new Date();
    scheduledTime.setHours(sleepHour, sleepMinute, 0, 0);

    console.log(`[Sleep Notification] Scheduled time (today): ${scheduledTime.toLocaleString('vi-VN')}`);

    if (scheduledTime.getTime() < now.getTime()) {
      console.log(`[Sleep Notification] Sleep start time (${sleepStartTime}) has already passed today. Skipping notification.`);
      return true; 
    }

    const delaySeconds = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);

    if (delaySeconds < 10) {
      console.log(`[Sleep Notification] Delay too short (${delaySeconds}s). Skipping notification.`);
      return true;
    }

    console.log(`[Sleep Notification] Scheduling notification in ${delaySeconds} seconds (${Math.floor(delaySeconds / 3600)}h ${Math.floor((delaySeconds % 3600) / 60)}m)`);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Đã đến giờ ngủ! 😴",
        body: `Hãy đi ngủ ngay để thức dậy lúc ${wakeUpTime}`,
        categoryIdentifier: "sleep-reminder",
        sound: "default",
        data: {
          type: "sleep-reminder",
          sleepTime: sleepStartTime,
          wakeTime: wakeUpTime
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        repeats: false,
        channelId: "sleep-reminder",
      },
    });

    console.log(`[Sleep Notification] ✅ Notification scheduled successfully with ID: ${notificationId}`);

    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const sleepNotifications = allScheduled.filter(n => n.content.categoryIdentifier === "sleep-reminder");
    console.log(`[Sleep Notification] Total scheduled sleep notifications: ${sleepNotifications.length}`);
    if (sleepNotifications.length > 0) {
      sleepNotifications.forEach(n => {
        console.log(`[Sleep Notification] - ID: ${n.identifier}, Trigger:`, n.trigger);
      });
    }

    return true;
  } catch (error) {
    console.error("Error scheduling sleep notification:", error);
    return false;
  }
}

export async function cancelSleepNotifications() {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.categoryIdentifier === "sleep-reminder") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    console.log("Sleep notifications cancelled");
    return true;
  } catch (error) {
    console.error("Error cancelling sleep notifications:", error);
    return false;
  }
}

