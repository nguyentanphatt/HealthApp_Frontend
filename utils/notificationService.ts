import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        // Check if this is our tracking notification
        if (notification.request.content.data?.type === 'tracking') {
            return {
                shouldShowAlert: false, // Don't show alert to avoid covering screen
                shouldPlaySound: false,
                shouldSetBadge: false,
                shouldShowBanner: false, // Don't show banner
                shouldShowList: true, // Only show in notification list
            };
        }
        
        return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: true,
        };
    },
});

export interface TrackingData {
    elapsedTime: number;
    distance: number;
    stepCount: number;
    currentSpeed: number;
    avgSpeed: number;
    isPaused: boolean;
}

class NotificationService {
    private notificationId: string | null = null;
    private updateInterval: ReturnType<typeof setInterval> | null = null;
    private timerInterval: ReturnType<typeof setInterval> | null = null;
    private startTime: number | null = null;
    private elapsedTime: number = 0;
    private isPaused: boolean = false;

    async requestPermissions(): Promise<boolean> {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        
        return finalStatus === 'granted';
    }

    async startTrackingNotification(): Promise<void> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                console.log('Notification permission not granted');
                return;
            }

            // Cancel any existing notification
            if (this.notificationId) {
                await Notifications.dismissNotificationAsync(this.notificationId);
            }

            // Start internal timer
            this.startInternalTimer();

            // Create simple notification for notification bar only
            const notificationId = await Notifications.scheduleNotificationAsync({
                identifier: 'activity_tracking_notification',
                content: {
                    title: '🏃‍♂️ Đang chạy bộ',
                    body: 'Thời gian: 00:00',
                    data: { type: 'tracking' },
                    priority: 'high',
                    sound: false,
                    sticky: false,
                    vibrate: [],
                },
                trigger: null, // Show immediately
            });

            this.notificationId = notificationId;
            console.log('Tracking notification started');
        } catch (error) {
            console.log('Error starting tracking notification:', error);
        }
    }

    async updateTrackingNotification(data: TrackingData): Promise<void> {
        if (!this.notificationId) return;

        try {
            // Use internal timer time instead of external data
            const timeText = this.formatTime(this.elapsedTime);
            const statusText = this.isPaused ? '⏸️ Tạm dừng' : '🏃‍♂️ Đang chạy';
            const body = `Thời gian: ${timeText}`;

            // Update existing notification using identifier to keep the same notification
            await Notifications.scheduleNotificationAsync({
                identifier: 'activity_tracking_notification',
                content: {
                    title: statusText,
                    body: body,
                    data: { 
                        type: 'tracking',
                        elapsedTime: this.elapsedTime,
                        isPaused: this.isPaused
                    },
                    priority: 'high',
                    sound: false,
                    sticky: false,
                    vibrate: [],
                },
                trigger: null,
            });

        } catch (error) {
            console.log('Error updating tracking notification:', error);
        }
    }

    async startLiveUpdates(getTrackingData: () => TrackingData, intervalMs: number = 5000): Promise<void> {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Start immediate update
        try {
            const data = getTrackingData();
            this.isPaused = data.isPaused;
            await this.updateTrackingNotification(data);
        } catch (error) {
            console.log('Error in immediate notification update:', error);
        }

        this.updateInterval = setInterval(async () => {
            try {
                // Update internal state from external data
                const data = getTrackingData();
                this.isPaused = data.isPaused;
                
                // Update notification with internal timer
                await this.updateTrackingNotification(data);
            } catch (error) {
                console.log('Error in live notification update:', error);
            }
        }, intervalMs);
    }

    async stopTrackingNotification(): Promise<void> {
        try {
            if (this.notificationId) {
                await Notifications.dismissNotificationAsync(this.notificationId);
                this.notificationId = null;
            }

            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }

            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            // Reset internal state
            this.startTime = null;
            this.elapsedTime = 0;
            this.isPaused = false;

            console.log('Tracking notification stopped');
        } catch (error) {
            console.log('Error stopping tracking notification:', error);
        }
    }

    private startInternalTimer(): void {
        // Clear existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Set start time
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.isPaused = false;

        // Start timer
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.startTime) {
                this.elapsedTime = Date.now() - this.startTime;
            }
        }, 100); // Update every 100ms for accuracy
    }

    private formatTime(milliseconds: number): string {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    private formatDistance(meters: number): string {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        } else {
            return `${(meters / 1000).toFixed(2)}km`;
        }
    }

    private formatSpeed(mps: number): string {
        const kmh = mps * 3.6;
        return `${kmh.toFixed(1)}km/h`;
    }

    // Get current notification data
    getCurrentNotificationId(): string | null {
        return this.notificationId;
    }

    // Check if notification is active
    isNotificationActive(): boolean {
        return this.notificationId !== null;
    }

    // Pause internal timer
    pauseTimer(): void {
        this.isPaused = true;
    }

    // Resume internal timer
    resumeTimer(): void {
        this.isPaused = false;
        if (this.startTime) {
            // Adjust start time to account for pause duration
            this.startTime = Date.now() - this.elapsedTime;
        }
    }

    // Get current elapsed time
    getCurrentElapsedTime(): number {
        return this.elapsedTime;
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
