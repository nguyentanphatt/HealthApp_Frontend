import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState } from 'react-native';
import MapView, { Region } from 'react-native-maps';

import { getActivityById, getAllLocations, saveActivityData, saveLocation, updateActivityData } from '@/services/activity';
import {
    LatLng,
    TrackedPoint,
    calculateActiveTime,
    calculateAverageSpeed,
    calculateTotalDistance,
    checkLocationPermission,
    distanceBetween,
    requestActivityRecognitionPermission,
    saveActivityDataToStorage
} from '@/utils/activityHelper';
import { simpleNotificationService } from '@/utils/activityNotificationService';

type UseActivityTrackingResult = {
    hasPermission: boolean | null;
    positions: TrackedPoint[];
    current: LatLng | null;
    isStart: boolean;
    isPause: boolean;
    isLocked: boolean;
    avgSpeed: number;
    currentSpeed: number;
    maxSpeed: number;
    startTime: number | null;
    elapsed: number;
    totalPauseTime: number;
    activeTime: number;
    currentMV: number;
    showCountdown: boolean;
    countdown: number;
    stepCount: number;
    totalDistanceMeters: number;
    polygonCoords?: TrackedPoint[];

    animatedStyle: any;

    mapRef: React.MutableRefObject<MapView | null>;

    ensurePermission: () => Promise<boolean>;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
    handlePause: () => void;
    startCountdown: () => void;

    setIsLocked: (locked: boolean) => void;
    setIsStart: (value: boolean) => void;
};

export function useActivityTracking(): UseActivityTrackingResult {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [positions, setPositions] = useState<TrackedPoint[]>([]);
    const [current, setCurrent] = useState<LatLng | null>(null);
    const [showPolygon] = useState(false);
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

    // Refs
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

    // foreground/background tracking
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
                AsyncStorage.setItem('last_app_state', Date.now().toString());
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                AsyncStorage.setItem('app_pause_time', Date.now().toString());
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        AsyncStorage.setItem('last_app_state', Date.now().toString());

        return () => subscription?.remove();
    }, []);

    // Restore / init tracking session
    useEffect(() => {
        (async () => {
            //Check if app was killed and reset session
            try {
                const [activeStr, storedId, lastAppState] = await AsyncStorage.multiGet(['activity_tracking_active', 'activity_session_id', 'last_app_state']).then(entries => entries.map(e => e?.[1] ?? null));
                const wasActive = activeStr === 'true';
                const currentTime = Date.now();
                const lastStateTime = lastAppState ? parseInt(lastAppState) : 0;

                if (wasActive && storedId && (currentTime - lastStateTime > 30000 || !lastAppState)) {
                    console.log('App was killed, resetting activity session');
                    await AsyncStorage.multiRemove(['activity_tracking_active', 'activity_session_id', 'last_app_state']);
                    return;
                }

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
                                            accuracy: Location.Accuracy.BestForNavigation,
                                            timeInterval: 2000, // Update every 2s
                                            distanceInterval: 0,
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

    // Update time
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

            //Notification
            await simpleNotificationService.startTrackingNotification();

            subscriptionRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 2000,
                    distanceInterval: 0,
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

        const endTime = Date.now();

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
            endTime,
            elapsed,
            activeTime
        });

        // Stop notification
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

    const { useAnimatedStyle, useSharedValue, withDelay, withTiming, runOnJS } = require('react-native-reanimated');

    const fadeShared = useSharedValue(0);
    const scaleShared = useSharedValue(0.5);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: fadeShared.value,
        transform: [{ scale: scaleShared.value }],
    }));

    const startCountdown = () => {
        setShowCountdown(true);
        setCountdown(3);
        fadeAnim.setValue(0);

        const animateCountdown = (num: number) => {
            fadeShared.value = 0;
            scaleShared.value = 0.5;
            fadeShared.value = withTiming(1, { duration: 300 });
            scaleShared.value = withTiming(1, { duration: 300 });
            fadeShared.value = withDelay(400, withTiming(0, { duration: 300 }));
        };

        animateCountdown(3);

        let currentVal = 3;
        const interval = setInterval(() => {
            currentVal -= 1;
            if (currentVal <= 0) {
                clearInterval(interval);
                fadeShared.value = withTiming(0, { duration: 300 }, () => {
                    runOnJS(setShowCountdown)(false);
                    runOnJS(startTracking)();
                });
            } else {
                setCountdown(currentVal);
                animateCountdown(currentVal);
            }
        }, 1000);
    };

    // Calculate total distance
    const totalDistanceMeters = totalDistanceRef.current > 0 ? totalDistanceRef.current : calculateTotalDistance(positions);
    const polygonCoords = showPolygon && positions.length >= 3 ? [...positions, positions[0]] : undefined;

    // Auto update data
    useEffect(() => { isStartRef.current = isStart; }, [isStart]);
    useEffect(() => { isPauseRef.current = isPause; }, [isPause]);
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

    // Interval 5s to sync data
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
            //Current snapshot
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

            try {
                isSyncingRef.current = true;
                const distanceKm = Number.isFinite(snapshot.distance) ? snapshot.distance / 1000 : 0;
                const stepCountNum = Number.isFinite(snapshot.stepCount as unknown as number) ? Number(snapshot.stepCount) : 0;
                const avgSpeedNum = Number.isFinite(snapshot.avgSpeed) ? snapshot.avgSpeed : 0;
                const maxSpeedNum = Number.isFinite(snapshot.maxSpeed) ? snapshot.maxSpeed : 0;
                const kcalNum = Number.isFinite(snapshot.caloriesBurned) ? snapshot.caloriesBurned : 0;
                const totalTimeNum = Number.isFinite(snapshot.elapsed) ? snapshot.elapsed / 1000 / 60 : 0;
                const activeTimeNum = Number.isFinite(snapshot.activeTime) ? snapshot.activeTime / 1000 / 60 : 0;

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

                    const createdId = (res as any)?.sessionId ?? (res as any)?.data?.sessionId ?? null;
                    if (createdId != null) {
                        sessionIdRef.current = Number(createdId);

                        try {
                            await AsyncStorage.setItem('activity_session_id', String(createdId));
                            await AsyncStorage.setItem('activity_tracking_active', 'true');
                        } catch { }
                    }
                } else if (sessionIdRef.current != null) {
                    await updateActivityData(sessionIdRef.current, {
                        distanceKm,
                        stepCount: stepCountNum,
                        avgSpeed: avgSpeedNum,
                        maxSpeed: maxSpeedNum,
                        kcal: kcalNum,
                        totalTime: totalTimeNum,
                        activeTime: activeTimeNum,
                    });

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

    return {
        hasPermission,
        positions,
        current,
        isStart,
        isPause,
        isLocked,
        avgSpeed,
        currentSpeed,
        maxSpeed,
        startTime,
        elapsed,
        totalPauseTime,
        activeTime,
        currentMV,
        showCountdown,
        countdown,
        stepCount,
        totalDistanceMeters,
        polygonCoords,
        animatedStyle,
        mapRef,
        ensurePermission,
        startTracking,
        stopTracking,
        handlePause,
        startCountdown,
        setIsLocked,
        setIsStart,
    };
}


