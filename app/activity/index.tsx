import LockScreen from '@/components/LockScreen';
import { darkMapStyle, lightMapStyle } from '@/constants/mapStyle';
import { useAppTheme } from '@/context/appThemeContext';
import { getActivityById, getAllLocations, saveActivityData, saveLocation, updateActivityData } from '@/services/activity';
import {
    LatLng,
    TrackedPoint,
    calculateActiveTime,
    calculateAverageSpeed,
    calculateTotalDistance,
    checkLocationPermission,
    distanceBetween,
    formatDistanceRT,
    formatSpeed,
    formatTime,
    requestActivityRecognitionPermission,
    saveActivityDataToStorage
} from '@/utils/activityHelper';
import { simpleNotificationService } from '@/utils/activityNotificationService';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location";
import { Href, useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon, Polyline, Region } from "react-native-maps";
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

const Page = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [positions, setPositions] = useState<TrackedPoint[]>([]);
    const [current, setCurrent] = useState<LatLng | null>(null);
    const [showPolygon, setShowPolygon] = useState(false);
    const [isStart, setIsStart] = useState(false);
    const [isPause, setIsPause] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [avgSpeed, setAvgSpeed] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [maxSpeed, setMaxSpeed] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
    const [totalPauseTime, setTotalPauseTime] = useState(0);
    const [activeTime, setActiveTime] = useState(0);
    const [currentMV, setCurrentMV] = useState(0);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [stepCount, setStepCount] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    //Refs
    const isStartRef = useRef<boolean>(false);
    const isPauseRef = useRef<boolean>(false);
    const startTimeRef = useRef<number | null>(null);
    const pauseStartTimeRef = useRef<number | null>(null);
    const totalPauseTimeRef = useRef<number>(0);
    const mvSumRef = useRef<number>(0);
    const mvCountRef = useRef<number>(0);
    const mapRef = useRef<MapView | null>(null);
    const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPositionRef = useRef<LatLng | null>(null);
    const lastPositionTimeRef = useRef<number | null>(null);
    const totalDistanceRef = useRef<number>(0);

    // Accelerometer (fallback)
    const accelSubRef = useRef<any>(null);
    const emaMagRef = useRef<number>(0);
    const lastNetRef = useRef<number>(0);
    const risingRef = useRef<boolean>(false);
    const candidatePeakRef = useRef<{ value: number; time: number } | null>(null);
    const lastStepTimeRef = useRef<number>(0);
    const thresholdRef = useRef<number>(0.02);
    const warmupCountRef = useRef<number>(0);
    const absNetEmaRef = useRef<number>(0);

    const ensurePermission = async (): Promise<boolean> => {
        if (hasPermission) return true;

        const granted = await checkLocationPermission();
        setHasPermission(granted);

        if (granted) {
            await requestActivityRecognitionPermission();
        }

        return granted;
    };

    // Track app state changes
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
                AsyncStorage.setItem('last_app_state', Date.now().toString());
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                // Save pause time when app goes to background
                AsyncStorage.setItem('app_pause_time', Date.now().toString());
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Set initial app state
        AsyncStorage.setItem('last_app_state', Date.now().toString());

        return () => subscription?.remove();
    }, []);

    useEffect(() => {
        (async () => {
            // Check if app was killed and reset session if needed
            try {
                const [activeStr, storedId, lastAppState] = await AsyncStorage.multiGet(['activity_tracking_active', 'activity_session_id', 'last_app_state']).then(entries => entries.map(e => e?.[1] ?? null));
                const wasActive = activeStr === 'true';
                const currentTime = Date.now();
                const lastStateTime = lastAppState ? parseInt(lastAppState) : 0;

                // If app was killed more than 30s then reset session 
                if (wasActive && storedId && (currentTime - lastStateTime > 30000 || !lastAppState)) {
                    console.log('App was killed, resetting activity session');
                    await AsyncStorage.multiRemove(['activity_tracking_active', 'activity_session_id', 'last_app_state']);
                    return;
                }
                // If app was killed less than 30s then get activity data
                if (wasActive && storedId && (currentTime - lastStateTime <= 30000)) {
                    const sid = Number(storedId);
                    if (Number.isFinite(sid)) {
                        const data = await getActivityById(sid);
                        const locations = await getAllLocations(sid);

                        if (locations?.data && Array.isArray(locations.data)) {
                            const convertedPositions: TrackedPoint[] = locations.data.map((loc: any) => ({
                                latitude: loc.lat,
                                longitude: loc.lng,
                                time: new Date(loc.time).getTime()
                            }));
                            setPositions(convertedPositions);
                        }
                        sessionIdRef.current = sid;
                        hasCreatedFirstSnapshotRef.current = true;
                        try {
                            const server = (data as any)?.data ?? data;
                            if (server?.startTime) {
                                const start = new Date(server.startTime).getTime();
                                setStartTime(start);
                                startTimeRef.current = start;
                            }

                            const totalTimeNum = Number(server?.totalTime ?? 0) || 0;
                            const activeTimeNum = Number(server?.activeTime ?? 0) || 0;
                            const avgSpeedNum = Number(server?.avgSpeed ?? 0) || 0;
                            const maxSpeedNum = Number(server?.maxSpeed ?? 0) || 0;
                            const stepCountNum = Number(server?.stepCount ?? 0) || 0;
                            const distanceMNum = Number(server?.distanceM ?? (Number(server?.distanceKm ?? 0) * 1000)) || 0;

                            const [appPauseTime, isPausedStr, pauseStartStr, totalPauseStr] = await AsyncStorage
                                .multiGet(['app_pause_time', 'activity_is_paused', 'activity_pause_start', 'activity_total_pause'])
                                .then(entries => entries.map(e => e?.[1] ?? null));
                            const pauseDurationBackground = appPauseTime ? currentTime - parseInt(appPauseTime) : 0;
                            const wasPaused = isPausedStr === 'true';
                            const pauseStartTs = pauseStartStr ? parseInt(pauseStartStr) : 0;
                            const persistedTotalPause = totalPauseStr ? parseInt(totalPauseStr) : 0;
                            const pauseDurationWhileKilled = wasPaused && pauseStartTs > 0 ? (currentTime - pauseStartTs) : 0;
                            const accumulatedPause = Math.max(0, persistedTotalPause + pauseDurationBackground + pauseDurationWhileKilled);

                            setElapsed(totalTimeNum);
                            setActiveTime(activeTimeNum);
                            setTotalPauseTime(prev => prev + accumulatedPause);
                            totalPauseTimeRef.current += accumulatedPause;
                            setAvgSpeed(avgSpeedNum);
                            setMaxSpeed(maxSpeedNum);
                            setStepCount(stepCountNum);
                            totalDistanceRef.current = distanceMNum;
                            try {
                                const lp = server?.LocationPoint;
                                if (Array.isArray(lp) && lp.length > 0) {
                                    const lastTime = Number(lp[lp.length - 1]?.time ?? 0);
                                    if (Number.isFinite(lastTime)) lastSyncedLocationTimeRef.current = lastTime;
                                }
                            } catch { }
                        } catch { }

                        // Ensure permission
                        try {
                            const ok = (await Location.getForegroundPermissionsAsync()).status === 'granted' || (await ensurePermission());
                            if (ok) {
                                await startAccelerometer();
                                if (!subscriptionRef.current) {
                                    subscriptionRef.current = await Location.watchPositionAsync(
                                        {
                                            //Continue tracking
                                            accuracy: Location.Accuracy.BestForNavigation,
                                            timeInterval: 2000, // Update every 2s
                                            distanceInterval: 0, // Update when move >= 0m
                                        },
                                        (loc) => {
                                            const coord: TrackedPoint = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, time: loc.timestamp ?? Date.now() };
                                            const now = Date.now();
                                            setPositions((p) => [...p, coord]);
                                            setCurrent(coord);
                                            const prev = lastPositionRef.current;
                                            const prevTime = lastPositionTimeRef.current;
                                            if (prev && prevTime && !isPauseRef.current) {
                                                const distance = distanceBetween(prev, coord);
                                                const timeDiff = (now - prevTime) / 1000;
                                                if (timeDiff > 0 && distance > 0) {
                                                    const speed = distance / timeDiff;
                                                    setCurrentSpeed(speed);
                                                    setMaxSpeed(prev => Math.max(prev, speed));
                                                    totalDistanceRef.current += distance;
                                                    const currentActive = calculateActiveTime(
                                                        startTimeRef.current,
                                                        pauseStartTimeRef.current,
                                                        totalPauseTimeRef.current
                                                    );
                                                    const avg = calculateAverageSpeed(totalDistanceRef.current, currentActive);
                                                    setAvgSpeed(avg);
                                                }
                                            }
                                            lastPositionRef.current = coord;
                                            lastPositionTimeRef.current = now;
                                            mapRef.current?.animateToRegion({
                                                ...coord,
                                                latitudeDelta: 0.005,
                                                longitudeDelta: 0.005,
                                            } as Region, 300);
                                        }
                                    );
                                }
                                if (!isStartRef.current) setIsStart(true);
                            }
                        } catch { }
                    }
                }
            } catch { }
            const { status } = await Location.requestForegroundPermissionsAsync();
            setHasPermission(status === "granted");
            if (status !== "granted") {
                Alert.alert("Không có quyền", "Ứng dụng cần quyền vị trí để hoạt động");
            } else {
                const last = await Location.getCurrentPositionAsync({});
                const coord = { latitude: last.coords.latitude, longitude: last.coords.longitude };
                setCurrent(coord);

                mapRef.current?.animateToRegion({
                    ...coord,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                } as Region, 500);
            }
        })();
        return () => {
            subscriptionRef.current?.remove();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (accelSubRef.current) {
                accelSubRef.current.remove();
                accelSubRef.current = null;
            }
        };
    }, []);

    // useEffect for elapsed time
    useEffect(() => {
        if (isStart && !isPause && startTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const totalElapsed = now - startTime;
                const currentPauseTime = pauseStartTime ? now - pauseStartTime : 0;
                const totalPause = totalPauseTime + currentPauseTime;
                setElapsed(totalElapsed);
                setActiveTime(totalElapsed - totalPause);
            }, 100);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isStart, isPause, startTime, pauseStartTime, totalPauseTime]);

    const resetAllState = () => {
        // Reset state
        setStartTime(null);
        setElapsed(0);
        setTotalPauseTime(0);
        setActiveTime(0);
        setAvgSpeed(0);
        setCurrentSpeed(0);
        setMaxSpeed(0);
        setPauseStartTime(null);
        pauseStartTimeRef.current = null;
        setIsPause(false);
        setStepCount(0);
        setCurrentMV(0);
        // reset refs
        startTimeRef.current = null;
        totalPauseTimeRef.current = 0;
        lastPositionRef.current = null;
        lastPositionTimeRef.current = null;
        totalDistanceRef.current = 0;
        emaMagRef.current = 0;
        lastNetRef.current = 0;
        risingRef.current = false;
        candidatePeakRef.current = null;
        lastStepTimeRef.current = 0;
        warmupCountRef.current = 0;
        absNetEmaRef.current = 0;
        mvSumRef.current = 0;
        mvCountRef.current = 0;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (accelSubRef.current) {
            accelSubRef.current.remove();
            accelSubRef.current = null;
        }
    };

    const startAccelerometer = async () => {
        const available = await Accelerometer.isAvailableAsync();
        if (!available) return;
        Accelerometer.setUpdateInterval(30);
        accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
            const mag = Math.sqrt(x * x + y * y + z * z);

            if (isStartRef.current && !isPauseRef.current) {
                mvSumRef.current += mag;
                mvCountRef.current += 1;
                setCurrentMV(mag);
            }

            const alpha = 0.1;
            emaMagRef.current = emaMagRef.current === 0
                ? mag
                : alpha * mag + (1 - alpha) * emaMagRef.current;

            const net = mag - emaMagRef.current;
            const absNet = Math.abs(net);
            const now = Date.now();

            const beta = 0.1;
            absNetEmaRef.current = absNetEmaRef.current === 0 ? absNet : beta * absNet + (1 - beta) * absNetEmaRef.current;
            if (absNetEmaRef.current < 0.02) {
                lastNetRef.current = net;
                return;
            }


            const upTh = Math.max(thresholdRef.current, absNetEmaRef.current * 0.8, 0.02);
            const downTh = -upTh * 0.5;
            if (net > upTh && lastNetRef.current <= upTh) {
                candidatePeakRef.current = { value: net, time: now };
            } else if (net > upTh && candidatePeakRef.current && net > candidatePeakRef.current.value) {
                candidatePeakRef.current.value = net;
            }

            if (net < downTh && lastNetRef.current >= downTh) {
                const minInterval = 400;
                const peak = candidatePeakRef.current;
                if (
                    peak &&
                    now - lastStepTimeRef.current >= minInterval &&
                    peak.value >= upTh * 1.4 &&
                    isStartRef.current && !isPauseRef.current
                ) {
                    setStepCount((c) => c + 1);
                    lastStepTimeRef.current = now;
                }
                candidatePeakRef.current = null;
            }

            lastNetRef.current = net;
        });
    };

    const startTracking = async () => {
        console.log("startTracking called");
        const ok = await ensurePermission();
        if (!ok) {
            Alert.alert("Lỗi quyền", "Bạn cần cấp quyền vị trí cho ứng dụng");
            return;
        }
        try {
            setPositions([]);
            resetAllState();
            const now = Date.now();
            setStartTime(now);
            startTimeRef.current = now;
            console.log('Expo Go detected; starting accelerometer');
            await startAccelerometer();

            try {
                await AsyncStorage.setItem('activity_tracking_active', 'true');
                await AsyncStorage.setItem('activity_start_time', String(now));
                await AsyncStorage.multiRemove(['activity_is_paused', 'activity_pause_start', 'activity_total_pause', 'app_pause_time']).catch(() => { });
            } catch { }

            // Start simple notification
            await simpleNotificationService.startTrackingNotification();

            subscriptionRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 2000, // Update every 2s
                    distanceInterval: 0, // Update when move >= 0m
                },
                (loc) => {
                    const coord: TrackedPoint = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, time: loc.timestamp ?? Date.now() };
                    const now = Date.now();

                    setPositions((p) => [...p, coord]);
                    setCurrent(coord);

                    const prev = lastPositionRef.current;
                    const prevTime = lastPositionTimeRef.current;
                    if (prev && prevTime && !isPauseRef.current) {
                        const distance = distanceBetween(prev, coord);
                        const timeDiff = (now - prevTime) / 1000;
                        if (timeDiff > 0 && distance > 0) {
                            const speed = distance / timeDiff;
                            setCurrentSpeed(speed);
                            setMaxSpeed(prev => Math.max(prev, speed));
                            totalDistanceRef.current += distance;
                            const currentActiveTime = calculateActiveTime(
                                startTimeRef.current,
                                pauseStartTimeRef.current,
                                totalPauseTimeRef.current
                            );
                            const avgSpeed = calculateAverageSpeed(totalDistanceRef.current, currentActiveTime);
                            setAvgSpeed(avgSpeed);
                        }
                    }

                    lastPositionRef.current = coord;
                    lastPositionTimeRef.current = now;

                    mapRef.current?.animateToRegion({
                        ...coord,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    } as Region, 300);
                }
            );
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể bắt đầu tracking");
        }
    };

    const stopTracking = async () => {
        AsyncStorage.removeItem('activity_session_id');
        let finalCalories = 0;
        if (mvCountRef.current > 0) {
            const avgMV = mvSumRef.current / mvCountRef.current;
            const totalTimeSeconds = activeTime / 1000;
            if (totalTimeSeconds > 0) {
                const eePerHour = 4.83 * avgMV + 122.02;
                const eePerSecond = eePerHour / 3600;
                finalCalories = eePerSecond * totalTimeSeconds;
            }
        }

        saveActivityDataToStorage({
            distance: totalDistanceMeters,
            stepCount,
            positions,
            avgSpeed,
            currentSpeed,
            maxSpeed,
            caloriesBurned: finalCalories,
            currentMV,
            startTime: startTimeRef.current,
            elapsed,
            activeTime
        });

        // Stop simple notification
        await simpleNotificationService.stopTrackingNotification();

        subscriptionRef.current?.remove();
        subscriptionRef.current = null;
        if (accelSubRef.current) {
            accelSubRef.current.remove();
            accelSubRef.current = null;
        }
        resetAllState();
        sessionIdRef.current = null;
        hasCreatedFirstSnapshotRef.current = false;
        AsyncStorage.removeItem('activity_tracking_active').catch(() => { });
        AsyncStorage.removeItem('activity_start_time').catch(() => { });
        AsyncStorage.multiRemove(['activity_is_paused', 'activity_pause_start', 'activity_total_pause', 'app_pause_time']).catch(() => { });
    };

    const handlePause = () => {
        if (isPause) {
            if (pauseStartTime) {
                const pauseDuration = Date.now() - pauseStartTime;
                setTotalPauseTime(prev => prev + pauseDuration);
                totalPauseTimeRef.current += pauseDuration;
                setPauseStartTime(null);
                pauseStartTimeRef.current = null;
                AsyncStorage.multiSet([
                    ['activity_total_pause', String(totalPauseTimeRef.current)],
                    ['activity_is_paused', 'false']
                ]).catch(() => { });
                AsyncStorage.removeItem('activity_pause_start').catch(() => { });
            }
        } else {
            const now = Date.now();
            setPauseStartTime(now);
            pauseStartTimeRef.current = now;
            AsyncStorage.multiSet([
                ['activity_pause_start', String(now)],
                ['activity_is_paused', 'true'],
                ['activity_total_pause', String(totalPauseTimeRef.current)]
            ]).catch(() => { });
        }
        setIsPause(!isPause);
    };

    const fade = useSharedValue(0);
    const scale = useSharedValue(0.5);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: fade.value,
        transform: [{ scale: scale.value }],
    }));

    const startCountdown = () => {
        setShowCountdown(true);
        setCountdown(3);
        fadeAnim.setValue(0);

        const animateCountdown = (num: number) => {
            fade.value = 0;
            scale.value = 0.5;

            // fade in + scale up
            fade.value = withTiming(1, { duration: 300 });
            scale.value = withTiming(1, { duration: 300 });

            // fade out sau 400ms
            fade.value = withDelay(400, withTiming(0, { duration: 300 }));
        };

        animateCountdown(3);

        let current = 3;
        const interval = setInterval(() => {
            current -= 1;
            if (current <= 0) {
                clearInterval(interval);
                // kết thúc countdown
                fade.value = withTiming(0, { duration: 300 }, () => {
                    runOnJS(setShowCountdown)(false);
                    runOnJS(startTracking)();
                });
            } else {
                runOnJS(setCountdown)(current);
                animateCountdown(current);
            }
        }, 1000);
    };


    // Calculate total distance
    const totalDistanceMeters = totalDistanceRef.current > 0 ? totalDistanceRef.current : calculateTotalDistance(positions);
    const polygonCoords = showPolygon && positions.length >= 3 ? [...positions, positions[0]] : undefined;


    // keep refs in sync to avoid stale closures inside sensor callbacks
    useEffect(() => { isStartRef.current = isStart; }, [isStart]);
    useEffect(() => { isPauseRef.current = isPause; }, [isPause]);
    // Ref for log
    const positionsRef = useRef<TrackedPoint[]>([]);
    const stepCountRef = useRef<number>(0);
    const currentSpeedRef = useRef<number>(0);
    const maxSpeedRef = useRef<number>(0);
    const currentMVRef = useRef<number>(0);
    const hasCreatedFirstSnapshotRef = useRef<boolean>(false);
    const isSyncingRef = useRef<boolean>(false);
    const sessionIdRef = useRef<number | null>(null);
    const lastSyncedLocationTimeRef = useRef<number>(0);

    useEffect(() => {
        positionsRef.current = positions;
        stepCountRef.current = stepCount;
        currentSpeedRef.current = currentSpeed;
        maxSpeedRef.current = maxSpeed;
        currentMVRef.current = currentMV;
    }, [positions, stepCount, currentSpeed, maxSpeed, currentMV]);


    useEffect(() => {
        if (!(isStart && !isPause)) return;

        const intervalId = setInterval(async () => {
            if (isSyncingRef.current) return;
            const currentActiveTime = calculateActiveTime(
                startTimeRef.current,
                pauseStartTimeRef.current,
                totalPauseTimeRef.current
            );

            let liveCalories = 0;
            if (mvCountRef.current > 0) {
                const avgMV = mvSumRef.current / mvCountRef.current;
                const totalTimeSeconds = currentActiveTime / 1000;
                if (totalTimeSeconds > 0) {
                    const eePerHour = 4.83 * avgMV + 122.02;
                    const eePerSecond = eePerHour / 3600;
                    liveCalories = eePerSecond * totalTimeSeconds;
                }
            }

            const avgSpeedLive = calculateAverageSpeed(
                totalDistanceRef.current,
                currentActiveTime
            );

            const totalElapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

            const snapshot = {
                distance: totalDistanceRef.current,
                stepCount: stepCountRef.current,
                positions: positionsRef.current,
                avgSpeed: avgSpeedLive,
                currentSpeed: currentSpeedRef.current,
                maxSpeed: maxSpeedRef.current,
                caloriesBurned: liveCalories,
                currentMV: currentMVRef.current,
                startTime: startTimeRef.current,
                elapsed: totalElapsed,
                activeTime: currentActiveTime
            };

            console.log('Activity snapshot', snapshot);

            try {
                isSyncingRef.current = true;
                const distanceKm = Number.isFinite(snapshot.distance) ? snapshot.distance / 1000 : 0;
                const stepCountNum = Number.isFinite(snapshot.stepCount as unknown as number) ? Number(snapshot.stepCount) : 0;
                const avgSpeedNum = Number.isFinite(snapshot.avgSpeed) ? snapshot.avgSpeed : 0;
                const maxSpeedNum = Number.isFinite(snapshot.maxSpeed) ? snapshot.maxSpeed : 0;
                const kcalNum = Number.isFinite(snapshot.caloriesBurned) ? snapshot.caloriesBurned : 0;
                const totalTimeNum = Number.isFinite(snapshot.elapsed) ? snapshot.elapsed / 1000 / 60 : 0; // Convert ms to minutes
                const activeTimeNum = Number.isFinite(snapshot.activeTime) ? snapshot.activeTime / 1000 / 60 : 0; // Convert ms to minutes

                if (!hasCreatedFirstSnapshotRef.current) {
                    hasCreatedFirstSnapshotRef.current = true;
                    const res = await saveActivityData(
                        'walk',
                        0,
                        snapshot.startTime ?? Date.now(),
                        Date.now(),
                        distanceKm,
                        stepCountNum,
                        avgSpeedNum,
                        maxSpeedNum,
                        kcalNum,
                        totalTimeNum,
                        activeTimeNum,
                    );
                    console.log("data created");

                    const createdId = (res as any)?.sessionId ?? (res as any)?.data?.sessionId ?? null;
                    if (createdId != null) {
                        sessionIdRef.current = Number(createdId);

                        try {
                            await AsyncStorage.setItem('activity_session_id', String(createdId));
                            await AsyncStorage.setItem('activity_tracking_active', 'true');
                        } catch { }
                    }
                } else if (sessionIdRef.current != null) {
                    const response = await updateActivityData(sessionIdRef.current, {
                        distanceKm,
                        stepCount: stepCountNum,
                        avgSpeed: avgSpeedNum,
                        maxSpeed: maxSpeedNum,
                        kcal: kcalNum,
                        totalTime: totalTimeNum,
                        activeTime: activeTimeNum,
                    });

                    console.log("data updated in db", response);

                    const unsynced = positionsRef.current
                        .filter(p => p.time > lastSyncedLocationTimeRef.current)
                        .map(({ latitude, longitude, time }) => ({ latitude, longitude, time }));
                    if (unsynced.length > 0) {
                        await saveLocation(sessionIdRef.current as number, unsynced);
                        lastSyncedLocationTimeRef.current = unsynced[unsynced.length - 1].time;
                    }
                }
            } catch (err: any) {
                const status = err?.response?.status;
                const data = err?.response?.data;
                console.error('sync failed', { status, data, err });
                if (sessionIdRef.current == null) {
                    hasCreatedFirstSnapshotRef.current = false;
                }
            } finally {
                isSyncingRef.current = false;
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isStart, isPause]);

    return (
        <View className="flex-1 gap-2.5 py-10 font-lato-regular" style={{ backgroundColor: theme.colors.background }}>
            {isStart ? (
                <View className='flex items-center justify-center gap-5 mt-12'>
                    <View className='flex flex-row items-center justify-center gap-5'>
                        <View className='flex items-center justify-center rounded-md shadow-md p-2 w-[45%]' style={{ backgroundColor: theme.colors.card }}>
                            <Text className='text-lg' style={{ color: theme.colors.textSecondary }}>Thời gian</Text>
                            <Text className='text-xl font-bold' style={{ color: theme.colors.textPrimary }}>{formatTime(activeTime)}</Text>
                        </View>
                        <View className='flex items-center justify-center rounded-md shadow-md p-2 w-[45%]' style={{ backgroundColor: theme.colors.card }}>
                            <Text className='text-lg' style={{ color: theme.colors.textSecondary }}>Tốc độ hiện tại</Text>
                            <Text className='text-xl font-bold' style={{ color: theme.colors.textPrimary }}>{formatSpeed(currentSpeed)}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row items-center justify-center gap-5'>
                        <View className='flex items-center justify-center rounded-md shadow-md p-2 w-[45%]' style={{ backgroundColor: theme.colors.card }}>
                            <Text className='text-lg' style={{ color: theme.colors.textSecondary }}>Khoảng cách</Text>
                            <Text className='text-xl font-bold' style={{ color: theme.colors.textPrimary }}>{formatDistanceRT(totalDistanceMeters)}</Text>
                        </View>
                        <View className='flex items-center justify-center rounded-md shadow-md p-2 w-[45%]' style={{ backgroundColor: theme.colors.card }}>
                            <Text className='text-lg' style={{ color: theme.colors.textSecondary }}>Bước đi</Text>
                            <Text className='text-xl font-bold' style={{ color: theme.colors.textPrimary }}>{stepCount}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View className="flex flex-row items-center justify-between px-4 pt-10">
                    <TouchableOpacity onPress={() => router.push("/(tabs)")} className='w-[30px]'>
                        <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>Vận động</Text>
                    <View style={{ width: 24 }} />
                </View>
            )}

            {hasPermission === false ? (
                <View className="m-4 p-4 rounded-xl" style={{ backgroundColor: theme.colors.card }}>
                    <Text className="text-base mb-3" style={{ color: theme.colors.textSecondary }}>Ứng dụng cần quyền truy cập vị trí để theo dõi quãng đường.</Text>
                    <TouchableOpacity onPress={ensurePermission} className="bg-cyan-500 rounded-lg p-3">
                        <Text className="text-white text-center font-bold" style={{ color: theme.colors.textPrimary }}>Cấp quyền vị trí</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={{ width: '100%', height: isStart ? '50%' : '60%', marginTop: isStart ? 20 : 50 }}
                    customMapStyle={theme.mode === "dark" ? darkMapStyle : lightMapStyle}
                    scrollEnabled={!isLocked}
                    zoomEnabled={!isLocked}
                    rotateEnabled={!isLocked}
                    pitchEnabled={!isLocked}
                    initialRegion={{
                        latitude: current?.latitude ?? 21.0278,
                        longitude: current?.longitude ?? 105.8342,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation={true}
                    followsUserLocation={false}
                >
                    {positions.length > 0 && <Polyline coordinates={positions} strokeWidth={5} strokeColor="#007aff" />}
                    {polygonCoords && <Polygon coordinates={polygonCoords} fillColor="rgba(0,122,255,0.2)" strokeColor="rgba(0,122,255,0.5)" />}
                    {current && <Marker coordinate={current} title="Bạn đang ở đây" />}
                </MapView>
            )}

            {isStart && (
                <View className='absolute bottom-[30%] right-4'>
                    <TouchableOpacity
                        onPress={() => setShowPolygon((s) => !s)}
                        className="px-4 py-3 rounded-lg" style={{ backgroundColor: theme.colors.card }}>
                        <Text style={{ color: theme.colors.textPrimary }}>{showPolygon ? "Đường đi: bật" : "Đường đi: tắt"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLocked === false && (
                <View className='absolute bottom-[10%] -translate-x-1/2 left-1/2'>
                    {isStart ? (
                        <View className='flex-row items-center justify-center gap-10'>
                            <TouchableOpacity onPress={() => { setIsLocked(true) }} className='size-[60px] rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.card }}>
                                <FontAwesome6 name="lock" size={20} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePause} className='size-[90px] rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.card }}>
                                <FontAwesome6 name={isPause ? "play" : "pause"} size={36} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setIsStart(!isStart), stopTracking(), router.push("/activity/statistics" as Href) }} className='size-[60px] rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.card }}>
                                <FontAwesome6 name="xmark" size={20} color={theme.colors.textPrimary} />
                            </TouchableOpacity>

                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { setIsStart(!isStart), startCountdown() }} className='size-[90px] rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.card }}>
                            <FontAwesome6 name="person-walking" size={36} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    )}

                </View>
            )}

            {showCountdown && (
                <View className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Animated.Text
                        className="text-[200px] font-bold text-white"
                        style={animatedStyle}
                    >
                        {countdown}
                    </Animated.Text>
                </View>
            )}
            {isLocked && (
                <LockScreen setIsLocked={setIsLocked} />
            )}
        </View>
    )
}

export default Page