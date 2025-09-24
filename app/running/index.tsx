import { FontAwesome6 } from '@expo/vector-icons';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, Region } from "react-native-maps";

type LatLng = { latitude: number; longitude: number };

const Page = () => {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [tracking, setTracking] = useState(false);
    const [positions, setPositions] = useState<LatLng[]>([]);
    const [current, setCurrent] = useState<LatLng | null>(null);
    const [showPolygon, setShowPolygon] = useState(false);

    const mapRef = useRef<MapView | null>(null);
    const subscriptionRef = useRef<Location.LocationSubscription | null>(null);


    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setHasPermission(status === "granted");
            if (status !== "granted") {
                Alert.alert("Không có quyền", "Ứng dụng cần quyền vị trí để hoạt động");
            } else {
                // lấy vị trí hiện tại ban đầu để center map
                const last = await Location.getCurrentPositionAsync({});
                const coord = { latitude: last.coords.latitude, longitude: last.coords.longitude };
                setCurrent(coord);
                // center map
                mapRef.current?.animateToRegion({
                    ...coord,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                } as Region, 500);
            }
        })();
        // cleanup khi unmount  
        return () => {
            subscriptionRef.current?.remove();
        };
    }, []);

    // Đảm bảo có quyền: nếu chưa, yêu cầu tại trang này
    const ensurePermission = async (): Promise<boolean> => {
        if (hasPermission) return true;
        const current = await Location.getForegroundPermissionsAsync();
        if (current.status === "granted") {
            setHasPermission(true);
            return true;
        }
        if (current.canAskAgain) {
            const req = await Location.requestForegroundPermissionsAsync();
            const granted = req.status === "granted";
            setHasPermission(granted);
            return granted;
        }
        return false;
    };

    const startTracking = async () => {
        const ok = await ensurePermission();
        if (!ok) {
            Alert.alert("Lỗi quyền", "Bạn cần cấp quyền vị trí cho ứng dụng");
            return;
        }
        try {
            setPositions([]); // reset nếu muốn bắt đầu lại
            setTracking(true);

            // watchPositionAsync sẽ gọi callback khi có vị trí mới
            subscriptionRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 2000,    // ms - thời gian giữa các lần cập nhật
                    distanceInterval: 5,   // meter - cập nhật khi di chuyển ≥ 5m
                },
                (loc) => {
                    const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    setPositions((p) => [...p, coord]);
                    console.log(coord);
                    setCurrent(coord);
                    // focus map vào vị trí mới
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
            setTracking(false);
        }
    };

    const stopTracking = () => {
        subscriptionRef.current?.remove();
        subscriptionRef.current = null;
        setTracking(false);
    };

    // helper: tính khoảng cách giữa 2 điểm (meters)
    const distanceBetween = (a: LatLng, b: LatLng) => {
        const toRad = (x: number) => (x * Math.PI) / 180;
        const R = 6371000; // m
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

    // nếu muốn polygon (đóng đường) — cần ≥ 3 điểm
    const polygonCoords = showPolygon && positions.length >= 3 ? [...positions, positions[0]] : undefined;

    return (
        <View className="flex-1 bg-[#f6f6f6] font-lato">
            <View className="flex flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.push("/(tabs)")}>
                    <FontAwesome6 name="chevron-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold  self-center">Đi bộ</Text>
                <View style={{ width: 24 }} />
            </View>

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
                    style={{width: '100%', height: '50%', marginTop: 50}}
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

            {/* Controls */}
            <View className="absolute left-4 right-4 bottom-8 flex-row justify-between items-center">
                <View className="bg-white rounded-lg p-3 shadow-lg">
                    <Text className="text-sm font-medium">Điểm: {positions.length}</Text>
                    <Text className="text-sm">Khoảng cách: {(totalDistanceMeters / 1000).toFixed(2)} km</Text>
                </View>

                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        onPress={() => setShowPolygon((s) => !s)}
                        className="bg-gray-200 px-4 py-3 rounded-lg"
                    >
                        <Text>{showPolygon ? "Polygon on" : "Polygon off"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={tracking ? stopTracking : startTracking}
                        className={`px-5 py-3 rounded-lg ${tracking ? "bg-red-500" : "bg-green-500"}`}
                        disabled={hasPermission === false}
                    >
                        <Text className="text-white font-semibold">{tracking ? "Stop" : "Start"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default Page