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
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
    });

    // Create sleep reminder channel
    await Notifications.setNotificationChannelAsync("sleep-reminder", {
      name: "Sleep Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#19B1FF",
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

// Schedule sleep time notification
export async function scheduleSleepNotification(sleepStartTime: string, wakeUpTime: string) {
  try {
    // Cancel existing sleep notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.categoryIdentifier === "sleep-reminder") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Parse times for validation
    const [sleepHour, sleepMinute] = sleepStartTime.split(":").map(Number);
    const [wakeHour, wakeMinute] = wakeUpTime.split(":").map(Number);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const sleepTimeInMinutes = sleepHour * 60 + sleepMinute;
    const wakeTimeInMinutes = wakeHour * 60 + wakeMinute;

    // Determine if this is a cross-day sleep schedule (e.g., sleep 22:00, wake 06:00)
    const isCrossDaySleep = sleepTimeInMinutes > wakeTimeInMinutes;

    // Check if current time has passed the wake time
    let shouldSkip = false;

    if (isCrossDaySleep) {
      // For cross-day schedules: skip if current time is between wake time and sleep time
      // Example: sleep 22:00, wake 06:00 -> skip if current time is 07:00 to 21:59
      shouldSkip = currentTimeInMinutes > wakeTimeInMinutes && currentTimeInMinutes < sleepTimeInMinutes;
    } else {
      // For same-day schedules: skip if current time is after wake time
      // Example: sleep 08:00, wake 16:00 -> skip if current time is after 16:00
      shouldSkip = currentTimeInMinutes > wakeTimeInMinutes;
    }

    if (shouldSkip) {
      console.log(`Current time (${currentHour}:${String(currentMinute).padStart(2, '0')}) has passed wake time (${wakeUpTime}). Sleep period ended. Skipping notification for today.`);
      return true; // Return true as this is not an error, just a skip condition
    }

    // Parse sleep start time for scheduling
    const [hour, minute] = sleepStartTime.split(":").map(Number);

    console.log(`Scheduling sleep notification at ${hour}:${minute}, wake time: ${wakeUpTime}`);

    // Schedule daily repeating notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Đã đến giờ ngủ! 😴",
        body: `Hãy đi ngủ ngay để thức dậy lúc ${wakeUpTime}`,
        categoryIdentifier: "sleep-reminder",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: "sleep-reminder",
          sleepTime: sleepStartTime,
          wakeTime: wakeUpTime
        },
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true,
        channelId: "sleep-reminder",
      },
    });

    console.log("Sleep notification scheduled successfully");
    return true;
  } catch (error) {
    console.error("Error scheduling sleep notification:", error);
    return false;
  }
}

// Cancel sleep notifications
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

