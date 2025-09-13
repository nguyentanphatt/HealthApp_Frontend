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
          options: { opensAppToForeground: false },
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
          await updateWaterReminder(data.id, data.message, data.expiresIn, false); 
        } else {
          console.log("App mở từ notification:", data);
        }
      }
    );

    return () => subscription.remove();
  }, []);
}
