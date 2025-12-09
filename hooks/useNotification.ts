import { saveWaterRecord, updateWaterReminder } from "@/services/water";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export function useNotifications() {
  useEffect(() => {
    const init = async () => {
      await Notifications.setNotificationCategoryAsync("water-reminder", [
        {
          identifier: "ADD_WATER",
          buttonTitle: "+ Thêm",
          options: { opensAppToForeground: true },
        },
      ]);

      await Notifications.setNotificationCategoryAsync("sleep-reminder", [
        {
          identifier: "VIEW_SLEEP",
          buttonTitle: "Xem",
          options: { opensAppToForeground: true },
        },
      ]);
    };
    init();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data as any;

        if (response.actionIdentifier === "ADD_WATER") {
          const now = Date.now();
          const amount = Number(data.message) || 250;

          await saveWaterRecord(amount, now.toString());
          await updateWaterReminder(data.id, data.message, (new Date(data.expiresIn).getTime()).toString(), false);

          const notificationId = response.notification.request.identifier;
          await Notifications.dismissNotificationAsync(notificationId);

          await Notifications.setNotificationCategoryAsync("water-added", [
            {
              identifier: "WATER_ADDED",
              buttonTitle: "✓ Đã thêm!",
              options: { opensAppToForeground: false, isDestructive: false, isAuthenticationRequired: false },
            },
          ]);

          const successNotificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Thành công",
              body: `Bạn vừa uống ${amount}ml nước`,
              categoryIdentifier: "water-added",
              data: { ...data, added: true },
            },
            trigger: null,
          });

          setTimeout(async () => {
            await Notifications.dismissNotificationAsync(successNotificationId);
          }, 5000);
        } else if (response.actionIdentifier === "VIEW_SLEEP") {
          console.log("View sleep action tapped:", data);
        } else if (data?.type === "sleep-reminder") {
          console.log("Sleep reminder notification tapped:", data);
        } else {
          console.log("App mở từ notification:", data);
        }
      }
    );

    return () => subscription.remove();
  }, []);
}
