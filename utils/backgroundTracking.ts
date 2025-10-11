import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';
import { distanceBetween } from './activityHelper';

// Background task constants
export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';
export const BACKGROUND_SENSOR_TASK = 'BACKGROUND_SENSOR_TASK';

// Define background location task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.log('Background location task error:', error);
        return;
    }
    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        console.log('Background location update received:', locations.length);
        
        // Store location data for when app comes back to foreground
        try {
            const currentPositions = await AsyncStorage.getItem('background_positions');
            const existingPositions = currentPositions ? JSON.parse(currentPositions) : [];
            
            const newPositions = locations.map(loc => ({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                time: loc.timestamp || Date.now()
            }));
            
            const updatedPositions = [...existingPositions, ...newPositions];
            await AsyncStorage.setItem('background_positions', JSON.stringify(updatedPositions));
            
            // Update distance calculation
            if (updatedPositions.length > 1) {
                let totalDistance = 0;
                for (let i = 1; i < updatedPositions.length; i++) {
                    const distance = distanceBetween(
                        { latitude: updatedPositions[i-1].latitude, longitude: updatedPositions[i-1].longitude },
                        { latitude: updatedPositions[i].latitude, longitude: updatedPositions[i].longitude }
                    );
                    totalDistance += distance;
                }
                await AsyncStorage.setItem('background_total_distance', totalDistance.toString());
            }
        } catch (err) {
            console.log('Error storing background location data:', err);
        }
    }
});

// Define background sensor task
TaskManager.defineTask(BACKGROUND_SENSOR_TASK, async () => {
    console.log('Background sensor task running');
    
    try {
        // Get current sensor data from storage
        const [mvSum, mvCount, stepCount] = await AsyncStorage.multiGet([
            'background_mv_sum',
            'background_mv_count', 
            'background_step_count'
        ]);
        
        const currentMvSum = parseFloat(mvSum[1] || '0');
        const currentMvCount = parseInt(mvCount[1] || '0');
        const currentStepCount = parseInt(stepCount[1] || '0');
        
        // Maintain existing data in background
        console.log('Background sensor data maintained:', { currentMvSum, currentMvCount, currentStepCount });
        
    } catch (err) {
        console.log('Error in background sensor task:', err);
    }
});

export const startBackgroundTracking = async () => {
    try {
        // Start background location tracking
        const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (!isRegistered) {
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 5000, // Update every 5s in background
                distanceInterval: 10, // Update when move >= 10m
                foregroundService: {
                    notificationTitle: "Đang theo dõi vận động",
                    notificationBody: "Ứng dụng đang theo dõi hoạt động của bạn",
                    notificationColor: "#007aff",
                },
            });
            console.log('Background location tracking started');
        }

        // Start background sensor task
        await BackgroundFetch.registerTaskAsync(BACKGROUND_SENSOR_TASK, {
            minimumInterval: 10000, // Run every 10 seconds
            stopOnTerminate: false,
            startOnBoot: true,
        });
        console.log('Background sensor task registered');
        
        return { success: true };
    } catch (err) {
        console.log('Error starting background tracking:', err);
        return { success: false, error: err };
    }
};

export const stopBackgroundTracking = async () => {
    try {
        // Stop background location tracking
        const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (isRegistered) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
            console.log('Background location tracking stopped');
        }

        // Stop background sensor task
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SENSOR_TASK);
        console.log('Background sensor task unregistered');
        
        return { success: true };
    } catch (err) {
        console.log('Error stopping background tracking:', err);
        return { success: false, error: err };
    }
};

export const saveCurrentStateForBackground = async (mvSum: number, mvCount: number, stepCount: number, totalDistance: number) => {
    try {
        await AsyncStorage.multiSet([
            ['background_mv_sum', mvSum.toString()],
            ['background_mv_count', mvCount.toString()],
            ['background_step_count', stepCount.toString()],
            ['background_total_distance', totalDistance.toString()]
        ]);
        console.log('Current state saved for background processing');
    } catch (err) {
        console.log('Error saving state for background:', err);
    }
};

export const restoreBackgroundData = async () => {
    try {
        const [backgroundPositions, backgroundDistance, bgMvSum, bgMvCount, bgStepCount] = await AsyncStorage.multiGet([
            'background_positions',
            'background_total_distance',
            'background_mv_sum',
            'background_mv_count',
            'background_step_count'
        ]);

        const result = {
            positions: backgroundPositions[1] ? JSON.parse(backgroundPositions[1]) : [],
            distance: backgroundDistance[1] ? parseFloat(backgroundDistance[1]) : 0,
            mvSum: bgMvSum[1] ? parseFloat(bgMvSum[1]) : 0,
            mvCount: bgMvCount[1] ? parseInt(bgMvCount[1]) : 0,
            stepCount: bgStepCount[1] ? parseInt(bgStepCount[1]) : 0
        };

        // Clear background data after restoring
        await AsyncStorage.multiRemove([
            'background_positions',
            'background_total_distance',
            'background_mv_sum',
            'background_mv_count',
            'background_step_count'
        ]);

        console.log('Background data restored successfully');
        return result;
    } catch (err) {
        console.log('Error restoring background data:', err);
        return {
            positions: [],
            distance: 0,
            mvSum: 0,
            mvCount: 0,
            stepCount: 0
        };
    }
};
