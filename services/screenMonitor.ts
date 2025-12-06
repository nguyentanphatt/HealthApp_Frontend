import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { ScreenMonitor } = NativeModules;
const screenMonitorEmitter = new NativeEventEmitter(ScreenMonitor);

type SavePointCallback = (type: 'sleep' | 'awake', timestamp: number) => Promise<void>;

class ScreenMonitorService {
  private isMonitoring = false;
  private sleepStartTime: number | null = null;
  private sleepEndTime: number | null = null;
  private sleepLogs: { timestamp: number; state: 'asleep' | 'awake' }[] = [];
  private screenOnListener: EmitterSubscription | null = null;
  private screenOffListener: EmitterSubscription | null = null;
  private recordId: string | null = null;
  private savePointCallback: SavePointCallback | null = null;
  private pendingRequests: { type: 'sleep' | 'awake', timestamp: number, retries: number }[] = [];
  private isProcessingQueue = false;

  startTracking(
    startTime: string,
    endTime: string,
    recordId?: string,
    onSavePoint?: SavePointCallback
  ) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.sleepStartTime = this.parseTimeToTimestamp(startTime);
    this.sleepEndTime = this.parseTimeToTimestamp(endTime);
    this.sleepLogs = [];
    this.recordId = recordId || null;
    this.savePointCallback = onSavePoint || null;
    this.pendingRequests = [];

    console.log(`[Screen Monitor] Started tracking from ${startTime} to ${endTime}`, recordId ? `with recordId: ${recordId}` : '');

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
    console.log('[Screen Monitor] Pending requests:', this.pendingRequests.length);

    // Process any remaining pending requests
    if (this.pendingRequests.length > 0) {
      this.processQueue().catch(err => {
        console.error('[Screen Monitor] Failed to process pending requests on stop:', err);
      });
    }

    this.recordId = null;
    this.savePointCallback = null;

    return this.sleepLogs;
  }

  private async handleScreenEvent(state: 'asleep' | 'awake') {
    if (!this.isWithinSleepTime()) return;

    const now = Date.now();
    const type = state === 'asleep' ? 'sleep' : 'awake';

    this.sleepLogs.push({ timestamp: now, state });

    const timeStr = new Date(now).toLocaleTimeString('vi-VN');
    const stateText = state === 'asleep' ? 'đã tắt màn hình (ngủ)' : 'đã bật màn hình (thức)';
    console.log(`[Screen Monitor] ${timeStr} - Người dùng ${stateText}`);

    // Save point via callback if available
    if (this.savePointCallback && this.recordId) {
      try {
        await this.savePointCallback(type, now);
        console.log(`[Screen Monitor] Successfully saved ${type} point to backend`);
      } catch (error) {
        console.error(`[Screen Monitor] Failed to save ${type} point:`, error);
        // Add to retry queue
        this.pendingRequests.push({ type, timestamp: now, retries: 0 });
        this.processQueue();
      }
    }
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.pendingRequests.length === 0) return;
    if (!this.savePointCallback) return;

    this.isProcessingQueue = true;

    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests[0];

      try {
        await this.savePointCallback(request.type, request.timestamp);
        console.log(`[Screen Monitor] Retry successful for ${request.type} point`);
        this.pendingRequests.shift(); // Remove from queue
      } catch (error) {
        request.retries++;
        console.error(`[Screen Monitor] Retry ${request.retries} failed for ${request.type} point:`, error);

        if (request.retries >= 3) {
          console.error(`[Screen Monitor] Max retries reached for ${request.type} point, removing from queue`);
          this.pendingRequests.shift();
        } else {
          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, 2000 * request.retries));
          break; // Exit loop to restart queue processing
        }
      }
    }

    this.isProcessingQueue = false;
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

  getPendingRequests() {
    return this.pendingRequests;
  }
}

export const screenMonitor = new ScreenMonitorService();
