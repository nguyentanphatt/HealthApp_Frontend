import LockScreen from '@/components/LockScreen';
import { FontAwesome6 } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import { Accelerometer, Pedometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, Region } from "react-native-maps";

type LatLng = { latitude: number; longitude: number };

const Page = () => {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [positions, setPositions] = useState<LatLng[]>([]);
    const [current, setCurrent] = useState<LatLng | null>(null);
    const [showPolygon, setShowPolygon] = useState(false);
    const [isStart, setIsStart] = useState(false);
    const [isPause, setIsPause] = useState(false);
    const isStartRef = useRef<boolean>(false);
    const isPauseRef = useRef<boolean>(false);
    const [isLocked, setIsLocked] = useState(false);
    const [avgSpeed, setAvgSpeed] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
    const [totalPauseTime, setTotalPauseTime] = useState(0);
    const [activeTime, setActiveTime] = useState(0);
    const [stepCount, setStepCount] = useState(0);
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
    const thresholdRef = useRef<number>(0.02); // higher base floor to reduce sensitivity
    const warmupCountRef = useRef<number>(0);
    const absNetEmaRef = useRef<number>(0); // adaptive motion level
    // Pedometer
    const pedometerSubRef = useRef<any>(null);
    const pedometerEventSeenRef = useRef<boolean>(false);
    const pedometerFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pedometerPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pedometerBaseTimeRef = useRef<number | null>(null);

    useEffect(() => {
        (async () => {
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
            if (pedometerSubRef.current) {
                pedometerSubRef.current.remove();
                pedometerSubRef.current = null;
            }
            if (pedometerFallbackTimerRef.current) {
                clearTimeout(pedometerFallbackTimerRef.current);
                pedometerFallbackTimerRef.current = null;
            }
            if (pedometerPollTimerRef.current) {
                clearInterval(pedometerPollTimerRef.current);
                pedometerPollTimerRef.current = null;
            }
            pedometerBaseTimeRef.current = null;
        };
    }, []);

    // Timer effect for elapsed time
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

    // Reset all state when starting new tracking
    const resetAllState = () => {
        setStartTime(null);
        setElapsed(0);
        setTotalPauseTime(0);
        setActiveTime(0);
        setAvgSpeed(0);
        setCurrentSpeed(0);
        setPauseStartTime(null);
        setIsPause(false);
        setStepCount(0);
        // reset refs
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
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (accelSubRef.current) {
            accelSubRef.current.remove();
            accelSubRef.current = null;
        }
        if (pedometerSubRef.current) {
            pedometerSubRef.current.remove();
            pedometerSubRef.current = null;
        }
        if (pedometerFallbackTimerRef.current) {
            clearTimeout(pedometerFallbackTimerRef.current);
            pedometerFallbackTimerRef.current = null;
        }
        if (pedometerPollTimerRef.current) {
            clearInterval(pedometerPollTimerRef.current);
            pedometerPollTimerRef.current = null;
        }
        pedometerBaseTimeRef.current = null;
    };

    // Đảm bảo có quyền: nếu chưa, yêu cầu tại trang này
    const ensurePermission = async (): Promise<boolean> => {
        if (hasPermission) return true;
        const current = await Location.getForegroundPermissionsAsync();
        if (current.status === "granted") {
            setHasPermission(true);
            // Request Activity Recognition on Android for step counting
            if (Platform.OS === 'android') {
                try {
                    const result = await PermissionsAndroid.request(
                        // @ts-ignore - string literal for Android permission
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
            return true;
        }
        if (current.canAskAgain) {
            const req = await Location.requestForegroundPermissionsAsync();
            const granted = req.status === "granted";
            setHasPermission(granted);
            if (granted && Platform.OS === 'android') {
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
            return granted;
        }
        return false;
    };

    const startAccelerometer = async () => {
        const available = await Accelerometer.isAvailableAsync();
        if (!available) return;
        Accelerometer.setUpdateInterval(30);
        accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
            const mag = Math.sqrt(x * x + y * y + z * z);
            
            // EMA baseline (dynamic gravity filter)
            const alpha = 0.1;
            emaMagRef.current = emaMagRef.current === 0 
              ? mag 
              : alpha * mag + (1 - alpha) * emaMagRef.current;
    
            const net = mag - emaMagRef.current;
            const absNet = Math.abs(net);
            const now = Date.now();

            // Motion level EMA (used for adaptive threshold & gating)
            const beta = 0.1;
            absNetEmaRef.current = absNetEmaRef.current === 0 ? absNet : beta * absNet + (1 - beta) * absNetEmaRef.current;
            // Gate: if overall motion level is too low, ignore to avoid micro shakes
            if (absNetEmaRef.current < 0.02) {
                lastNetRef.current = net;
                return;
            }

            // Hysteresis thresholds
            const upTh = Math.max(thresholdRef.current, absNetEmaRef.current * 0.8, 0.02);
            const downTh = -upTh * 0.5; // require a small dip below zero before confirming

            // Rising through upTh → potential peak start/update
            if (net > upTh && lastNetRef.current <= upTh) {
                candidatePeakRef.current = { value: net, time: now };
            } else if (net > upTh && candidatePeakRef.current && net > candidatePeakRef.current.value) {
                candidatePeakRef.current.value = net; // track max while above upTh
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

    const startPedometer = async () => {
        const available = await Pedometer.isAvailableAsync();
        console.log("Pedometer available:", available);
        if (!available) {
            console.log("Pedometer not available, falling back to accelerometer");
            // fallback to accelerometer
            await startAccelerometer();
            return;
        }
        pedometerEventSeenRef.current = false;
        pedometerBaseTimeRef.current = Date.now();
        // Pedometer returns steps since subscription started
        pedometerSubRef.current = Pedometer.watchStepCount(({ steps }) => {
            console.log("Pedometer watchStepCount steps:", steps, "isStart:", isStart, "isPause:", isPause);
            pedometerEventSeenRef.current = true;
            if (isStart && !isPause) {
                setStepCount(steps);
            }
        });
        if (!pedometerSubRef.current) {
            console.log("Pedometer subscription failed to start");
        } else {
            console.log("Pedometer subscription started");
            // If no events within 8s, auto-start accelerometer fallback
            pedometerFallbackTimerRef.current = setTimeout(async () => {
                if (!pedometerEventSeenRef.current) {
                    console.log("No pedometer events received in time; starting accelerometer fallback");
                    await startAccelerometer();
                }
            }, 8000);
            // Additionally poll Pedometer.getStepCountAsync every 2s
            if (pedometerPollTimerRef.current) {
                clearInterval(pedometerPollTimerRef.current);
            }
            pedometerPollTimerRef.current = setInterval(async () => {
                try {
                    if (!isStart || isPause) return;
                    const start = pedometerBaseTimeRef.current ?? Date.now();
                    const end = Date.now();
                    const { steps } = await Pedometer.getStepCountAsync(new Date(start), new Date(end));
                    console.log("Pedometer.getStepCountAsync steps:", steps, "interval:", (end - start) / 1000, "s");
                    setStepCount(steps);
                } catch (e) {
                    console.warn('Pedometer.getStepCountAsync failed:', e);
                }
            }, 2000);
        }
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
            setStartTime(Date.now());
            // Prefer accelerometer in Expo Go for easier testing
            if (Constants.appOwnership === 'expo') {
                console.log('Expo Go detected; starting accelerometer');
                await startAccelerometer();
            } else {
                console.log("Starting pedometer...");
                await startPedometer();
            }

            subscriptionRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 2000, // ms - thời gian giữa các lần cập nhật
                    distanceInterval: 0, // update when move >= 0m
                },
                (loc) => {
                    const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    const now = Date.now();

                    setPositions((p) => [...p, coord]);
                    setCurrent(coord);

                    const prev = lastPositionRef.current;
                    const prevTime = lastPositionTimeRef.current;
                    if (prev && prevTime && !isPause) {
                        const distance = distanceBetween(prev, coord);
                        const timeDiff = (now - prevTime) / 1000;
                        if (timeDiff > 0 && distance > 0) {
                            const speed = distance / timeDiff;
                            setCurrentSpeed(speed);
                            totalDistanceRef.current += distance;
                            const totalTime = activeTime / 1000;
                            if (totalTime > 0) {
                                const avgSpeed = totalDistanceRef.current / totalTime;
                                setAvgSpeed(avgSpeed);
                            }
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

    const stopTracking = () => {
        console.log("stopTracking called. stepCount:", stepCount);
        subscriptionRef.current?.remove();
        subscriptionRef.current = null;
        if (accelSubRef.current) {
            accelSubRef.current.remove();
            accelSubRef.current = null;
        }
        if (pedometerSubRef.current) {
            pedometerSubRef.current.remove();
            pedometerSubRef.current = null;
            console.log("Pedometer subscription removed");
        }
        if (pedometerFallbackTimerRef.current) {
            clearTimeout(pedometerFallbackTimerRef.current);
            pedometerFallbackTimerRef.current = null;
        }
        if (pedometerPollTimerRef.current) {
            clearInterval(pedometerPollTimerRef.current);
            pedometerPollTimerRef.current = null;
        }
        pedometerBaseTimeRef.current = null;
        resetAllState();
    };

    const handlePause = () => {
        if (isPause) {
            if (pauseStartTime) {
                const pauseDuration = Date.now() - pauseStartTime;
                setTotalPauseTime(prev => prev + pauseDuration);
                setPauseStartTime(null);
            }
        } else {
            setPauseStartTime(Date.now());
        }
        setIsPause(!isPause);
    };

    // helper: tính khoảng cách giữa 2 điểm (meters)
    const distanceBetween = (a: LatLng, b: LatLng) => {
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

    const totalDistanceMeters = positions.reduce((acc, _, i, arr) => {
        if (i === 0) return 0;
        return acc + distanceBetween(arr[i - 1], arr[i]);
    }, 0);

    const polygonCoords = showPolygon && positions.length >= 3 ? [...positions, positions[0]] : undefined;

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatSpeed = (speedMs: number) => {
        const speedKmh = (speedMs * 3.6).toFixed(1);
        return `${speedKmh} km/h`;
    };

    // keep refs in sync to avoid stale closures inside sensor callbacks
    useEffect(() => { isStartRef.current = isStart; }, [isStart]);
    useEffect(() => { isPauseRef.current = isPause; }, [isPause]);

    return (
        <View className="flex-1 gap-2.5 py-10 font-lato-regular bg-[#f6f6f6]">
            {isStart ? (
                <View className='flex items-center justify-center gap-5 mt-12'>
                    <View className='flex flex-row items-center justify-center gap-5'>
                        <View className='flex items-center justify-center bg-white rounded-md shadow-md p-2 w-[45%]'>
                            <Text className='text-lg text-black/60'>Thời gian</Text>
                            <Text className='text-xl text-black font-bold'>{formatTime(elapsed)}</Text>
                        </View>
                        <View className='flex items-center justify-center bg-white rounded-md shadow-md p-2 w-[45%]'>
                            <Text className='text-lg text-black/60'>Tốc độ hiện tại</Text>
                            <Text className='text-xl text-black font-bold'>{formatSpeed(currentSpeed)}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row items-center justify-center gap-5'>
                        <View className='flex items-center justify-center bg-white rounded-md shadow-md p-2 w-[45%]'>
                            <Text className='text-lg text-black/60'>Khoảng cách</Text>
                            <Text className='text-xl text-black font-bold'>{(totalDistanceMeters / 1000).toFixed(2)} km</Text>
                        </View>
                        <View className='flex items-center justify-center bg-white rounded-md shadow-md p-2 w-[45%]'>
                            <Text className='text-lg text-black/60'>Bước đi</Text>
                            <Text className='text-xl text-black font-bold'>{stepCount}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View className="flex flex-row items-center justify-between px-4 pt-10">
                    <TouchableOpacity onPress={() => router.push("/(tabs)")}>
                        <FontAwesome6 name="chevron-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold  self-center">Vận động</Text>
                    <View style={{ width: 24 }} />
                </View>
            )}

            {hasPermission === false ? (
                <View className="m-4 p-4 bg-white rounded-xl">
                    <Text className="text-base mb-3">Ứng dụng cần quyền truy cập vị trí để theo dõi quãng đường.</Text>
                    <TouchableOpacity onPress={ensurePermission} className="bg-cyan-500 rounded-lg p-3">
                        <Text className="text-white text-center font-bold">Cấp quyền vị trí</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <MapView
                    ref={mapRef}
                    style={{ width: '100%', height: isStart ? '50%' : '60%', marginTop: isStart ? 20 : 50 }}
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
                        className="bg-white px-4 py-3 rounded-lg"
                    >
                        <Text>{showPolygon ? "Đường đi: bật" : "Đường đi: tắt"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLocked === false && (
                <View className='absolute bottom-[10%] -translate-x-1/2 left-1/2'>
                    {isStart ? (
                        <View className='flex-row items-center justify-center gap-10'>
                            <TouchableOpacity onPress={() => { setIsLocked(true) }} className='size-[60px] rounded-full flex items-center justify-center bg-black/10'>
                                <FontAwesome6 name="lock" size={20} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePause} className='size-[90px] rounded-full flex items-center justify-center bg-black/10'>
                                <FontAwesome6 name={isPause ? "play" : "pause"} size={36} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setIsStart(!isStart), stopTracking() }} className='size-[60px] rounded-full flex items-center justify-center bg-black/10'>
                                <FontAwesome6 name="xmark" size={20} color="black" />
                            </TouchableOpacity>

                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { setIsStart(!isStart), startTracking() }} className='size-[90px] rounded-full flex items-center justify-center bg-black/10'>
                            <FontAwesome6 name="person-walking" size={36} color="black" />
                        </TouchableOpacity>
                    )}

                </View>
            )}

            {isLocked && (
                <LockScreen setIsLocked={setIsLocked} />
            )}
        </View>
    )
}

export default Page