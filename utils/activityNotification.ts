import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

const LOCATION_TASK = "BACKGROUND_RUNNING_TASK";

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        return;
    }
    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        
        try {
            // Get activity data from AsyncStorage
            const [startTimeStr, isPausedStr, pauseStartStr, totalPauseStr] = await AsyncStorage.multiGet([
                'activity_start_time',
                'activity_is_paused', 
                'activity_pause_start',
                'activity_total_pause'
            ]).then(entries => entries.map(e => e?.[1] ?? null));
            
            const startTime = startTimeStr ? parseInt(startTimeStr) : null;
            const isPaused = isPausedStr ? isPausedStr === 'true' : false;
            const pauseStart = pauseStartStr ? parseInt(pauseStartStr) : null;
            const totalPause = totalPauseStr ? parseInt(totalPauseStr) : 0;
            
            let currentTime = 0;
            if (startTime) {
                const now = Date.now();
                const totalElapsed = now - startTime;
                const currentPauseTime = isPaused && pauseStart ? now - pauseStart : 0;
                const totalPauseTime = totalPause + currentPauseTime;
                currentTime = totalElapsed - totalPauseTime;
            }
            
            // Format time to MM:SS
            const minutes = Math.floor(currentTime / 60000);
            const seconds = Math.floor((currentTime % 60000) / 1000);
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            await Notifications.scheduleNotificationAsync({
                content: {
                  title: "🏃 Đang chạy bộ",
                  body: `Thời gian: ${timeString}`,
                },
                trigger: null,
              });
        } catch (error) {
            console.error('Error getting activity time:', error);
            // Fallback notification without time
            await Notifications.scheduleNotificationAsync({
                content: {
                  title: "🏃 Đang chạy bộ",
                  body: "Đang theo dõi hoạt động...",
                },
                trigger: null,
              });
        }
    }
});