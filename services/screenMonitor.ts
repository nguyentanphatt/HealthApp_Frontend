import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { ScreenMonitor } = NativeModules;
const screenMonitorEmitter = new NativeEventEmitter(ScreenMonitor);

class ScreenMonitorService {
  private isMonitoring = false;
  private sleepStartTime: number | null = null;
  private sleepEndTime: number | null = null;
  private sleepLogs: Array<{ timestamp: number; state: 'asleep' | 'awake' }> = [];
  private screenOnListener: EmitterSubscription | null = null;
  private screenOffListener: EmitterSubscription | null = null;

  startTracking(startTime: string, endTime: string) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.sleepStartTime = this.parseTimeToTimestamp(startTime);
    this.sleepEndTime = this.parseTimeToTimestamp(endTime);
    this.sleepLogs = [];

    console.log(`[Screen Monitor] Started tracking from ${startTime} to ${endTime}`);

    // Listen to screen events
    this.screenOffListener = screenMonitorEmitter.addListener('onScreenOff', () => {
      this.handleScreenEvent('asleep');
    });

    this.screenOnListener = screenMonitorEmitter.addListener('onScreenOn', () => {
      this.handleScreenEvent('awake');
    });

    // Start native monitoring
    ScreenMonitor.startMonitoring();
  }

  stopTracking() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    // Remove listeners
    this.screenOffListener?.remove();
    this.screenOnListener?.remove();
    this.screenOffListener = null;
    this.screenOnListener = null;

    // Stop native monitoring
    ScreenMonitor.stopMonitoring();

    console.log('[Screen Monitor] Stopped tracking');
    console.log('[Screen Monitor] Sleep logs:', this.sleepLogs);

    return this.sleepLogs;
  }

  private handleScreenEvent(state: 'asleep' | 'awake') {
    if (!this.isWithinSleepTime()) return;

    const now = Date.now();
    this.sleepLogs.push({ timestamp: now, state });

    const timeStr = new Date(now).toLocaleTimeString('vi-VN');
    const stateText = state === 'asleep' ? 'đã tắt màn hình (ngủ)' : 'đã bật màn hình (thức)';
    console.log(`[Screen Monitor] ${timeStr} - Người dùng ${stateText}`);
  }

  private isWithinSleepTime(): boolean {
    const now = Date.now();

    if (!this.sleepStartTime || !this.sleepEndTime) return false;

    // Handle case where sleep time crosses midnight
    if (this.sleepEndTime < this.sleepStartTime) {
      return now >= this.sleepStartTime || now <= this.sleepEndTime;
    }

    return now >= this.sleepStartTime && now <= this.sleepEndTime;
  }

  private parseTimeToTimestamp(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now.getTime();
  }

  getSleepLogs() {
    return this.sleepLogs;
  }
}

export const screenMonitor = new ScreenMonitorService();
