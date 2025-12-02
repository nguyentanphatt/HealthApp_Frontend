import LockScreen from '@/components/LockScreen';
import { darkMapStyle, lightMapStyle } from '@/constants/mapStyle';
import { useAppTheme } from '@/context/appThemeContext';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { formatDistanceRT, formatSpeed, formatTime } from '@/utils/activityHelper';
import { FontAwesome6 } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon, Polyline } from "react-native-maps";

const Page = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const {
        hasPermission,
        positions,
        current,
        isStart,
        isPause,
        isLocked,
        currentSpeed,
        activeTime,
        showCountdown,
        countdown,
        stepCount,
        totalDistanceMeters,
        polygonCoords,
        animatedStyle,
        mapRef,
        ensurePermission,
        stopTracking,
        handlePause,
        startCountdown,
        setIsLocked,
        setIsStart,
    } = useActivityTracking();

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