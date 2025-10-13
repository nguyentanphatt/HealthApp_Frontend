import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        if (notification.request.content.data?.type === 'tracking') {
            return {
                shouldShowAlert: false, 
                shouldPlaySound: false,
                shouldSetBadge: false,
                shouldShowBanner: false, 
                shouldShowList: true, 
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

const createTrackingChannel = async () => {
    try {
        await Notifications.setNotificationChannelAsync('tracking_channel', {
            name: 'Activity Tracking',
            importance: Notifications.AndroidImportance.MIN, 
            vibrationPattern: [0], 
            lightColor: '#FF231F7C',
            sound: null, 
            enableLights: false,
            enableVibrate: false,
        });
    } catch (error) {
        console.log('Error creating tracking channel:', error);
    }
};

class SimpleNotificationService {
    private notificationId: string | null = null;

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
            await createTrackingChannel();

            if (this.notificationId) {
                await Notifications.dismissNotificationAsync(this.notificationId);
            }

            const notificationId = await Notifications.scheduleNotificationAsync({
                identifier: 'activity_tracking_notification',
                content: {
                    title: '🏃‍♂️ Đang chạy bộ',
                    body: 'Nhấn để mở ứng dụng',
                    data: { type: 'tracking' },
                    priority: Notifications.AndroidNotificationPriority.MIN,
                    sound: undefined,
                    sticky: true, 
                    vibrate: [0],
                    autoDismiss: false,
                },
                trigger: null,
            });

            this.notificationId = notificationId;
            console.log('Simple tracking notification started');
        } catch (error) {
            console.log('Error starting tracking notification:', error);
        }
    }

    async stopTrackingNotification(): Promise<void> {
        try {
            if (this.notificationId) {
                await Notifications.dismissNotificationAsync(this.notificationId);
                this.notificationId = null;
            }

            console.log('Tracking notification stopped');
        } catch (error) {
            console.log('Error stopping tracking notification:', error);
        }
    }

    isNotificationActive(): boolean {
        return this.notificationId !== null;
    }
}

export const simpleNotificationService = new SimpleNotificationService();
