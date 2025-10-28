import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { PermissionsAndroid, Platform } from 'react-native';


export type LatLng = { latitude: number; longitude: number };
export type TrackedPoint = LatLng & { time: number };

export const distanceBetween = (a: LatLng, b: LatLng) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
};

export const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatSpeed = (speedMs: number) => {
    const speedKmh = (speedMs * 3.6).toFixed(1);
    return `${speedKmh} km/h`;
};

// Format distance
export const formatDistance = (distanceMeters: number): string => {
    const meters = distanceMeters * 1000;
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    } else {
        return `${Math.round(meters)} m`;
    }
};

// Calo
export const calculateCaloriesFromMV = (mv: number, intervalMs: number = 30): number => {
    // EE = 4.83 × MV + 122.02 (kcal/h)
    const eePerHour = 4.83 * mv + 122.02;
    const eePerSecond = eePerHour / 3600; // kcal/s
    const eePerInterval = eePerSecond * (intervalMs / 1000);
    return eePerInterval;
};

// Active time
export const calculateActiveTime = (
    startTime: number | null,
    pauseStartTime: number | null,
    totalPauseTime: number
): number => {
    const now = Date.now();
    const totalElapsed = now - (startTime || now);
    const currentPauseTime = pauseStartTime ? now - pauseStartTime : 0;
    const totalPause = totalPauseTime + currentPauseTime;
    return totalElapsed - totalPause;
};

// Average speed
export const calculateAverageSpeed = (distance: number, activeTimeMs: number): number => {
    const totalTime = activeTimeMs / 1000;
    return totalTime > 0 ? distance / totalTime : 0;
};

// Save activity data to AsyncStorage
export const saveActivityDataToStorage = async (data: {
    distance: number;
    stepCount: number;
    positions: TrackedPoint[];
    avgSpeed: number;
    currentSpeed: number;
    maxSpeed: number;
    caloriesBurned: number;
    currentMV: number;
    startTime: number | null;
    elapsed: number;
    activeTime: number;
}) => {
    
    await AsyncStorage.multiSet([
        ["distance", data.distance.toString()],
        ["stepCount", data.stepCount.toString()],
        ["caloriesBurned", data.caloriesBurned.toString()],
        ["positions", JSON.stringify(data.positions)],
        ["avgSpeed", (data.avgSpeed * 3.6).toFixed(1)],
        ["currentSpeed", (data.currentSpeed * 3.6).toFixed(1)],
        ["maxSpeed", (data.maxSpeed * 3.6).toFixed(1)],
        ["currentMV", data.currentMV.toString()],
        ["startTime", data.startTime?.toString() ?? ""],
        ["elapsed", (data.elapsed / 60).toFixed(1)],
        ["activeTime", (data.activeTime / 60).toFixed(1)],
        ["endTime", Date.now().toString()],
        ["Date", new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })],
    ]);

    console.log("data:", data);
};

// Calculate total distance from positions array
export const calculateTotalDistance = (positions: LatLng[]): number => {
    return positions.reduce((acc, _, i, arr) => {
        if (i === 0) return 0;
        return acc + distanceBetween(arr[i - 1], arr[i]);
    }, 0);
};

// Check location permission
export const checkLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
};

// Request Activity Recognition permission on Android
export const requestActivityRecognitionPermission = async (): Promise<void> => { 
    if (Platform.OS === 'android') {
        try {
            const result = await PermissionsAndroid.request(
                'android.permission.ACTIVITY_RECOGNITION' as any,
                {
                    title: 'Quyền nhận diện hoạt động',
                    message: 'Ứng dụng cần quyền nhận diện hoạt động để đếm bước chân.',
                    buttonPositive: 'Cho phép',
                    buttonNegative: 'Từ chối',
                }
            );
            console.log('ACTIVITY_RECOGNITION request result:', result);
        } catch (e) {
            console.warn('Request ACTIVITY_RECOGNITION failed:', e);
        }
    }
};

