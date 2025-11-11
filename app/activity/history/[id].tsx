import ActivityResult from '@/components/ActivityResult';
import { darkMapStyle, lightMapStyle } from '@/constants/mapStyle';
import { useAppTheme } from '@/context/appThemeContext';
import { getActivityById, getAllLocations } from '@/services/activity';
import { formatDistance, formatTime } from '@/utils/activityHelper';
import { formatDateTimeRange } from '@/utils/convertTime';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const Page = () => {
    const { id } = useLocalSearchParams();
    const { theme } = useAppTheme();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const mapRef = useRef<MapView | null>(null);
    useEffect(() => {
        const fetchActivityData = async () => {
            try {
                const validId = Array.isArray(id) ? id[0] : id;
                const response = await getActivityById(validId);
                const location = await getAllLocations(validId);
                console.log("response", response);
                console.log("location", location);
                setData(response.data);
                setLocations(location.data);
                
                if (location.data && location.data.length > 0) {
                    const coordinates = location.data.map((point: any) => ({
                        latitude: point.lat,
                        longitude: point.lng
                    }));
                    
                    setTimeout(() => {
                        mapRef.current?.fitToCoordinates(coordinates, {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                            animated: true,
                        });
                    }, 1000);
                }
            } catch (error) {
                console.log("error", error);
            }
        }
        fetchActivityData();
    },[])
  return (
    <View className='flex-1 pt-12 font-lato' style={{ backgroundColor: theme.colors.background }}>
      <View className="flex flex-row items-center justify-between px-4 py-10">
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>Lịch sử</Text>
        <View style={{ width: 24 }} />
      </View>
    <ScrollView
      className="flex-1 px-4 font-lato-regular" style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4 mt-4" style={{ backgroundColor: theme.colors.card }}>
        <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>{formatDateTimeRange(data?.startTime || null, data?.endTime || '')}</Text>
        <View className="flex-row items-center justify-center mt-3 ">
          <View className='border-4 border-[#19B1FF] w-[70px] h-[70px] rounded-full p-2 items-center justify-center'>
            <FontAwesome6 name="person-running" size={28} color="#19B1FF" />
          </View>
        </View>
        <Text className="text-3xl font-bold text-center" style={{ color: theme.colors.textPrimary }}>
          {formatDistance((data?.distanceKm || 0))}
        </Text>
      </View>

      <View className="rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4 mt-4" style={{ backgroundColor: theme.colors.card }}>
        <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>Thông tin chi tiết</Text>
        <View className='flex-row items-center justify-between'>
          <View className='w-[45%] flex gap-3'>
            <ActivityResult
              icon="clock"
              title="Tổng thời gian"
              result={formatTime((data?.totalTime ? data.totalTime * 60 : 0))}
            />
            <ActivityResult
              icon="person-walking"
              title="Số bước"
              result={`${data?.stepCount ?? 0} bước`}
            />
            <ActivityResult
              icon="gauge"
              title="Vận tốc trung bình"
              result={`${data?.avgSpeed ?? 0} km/h`}
            />
          </View>
          <View className='w-[45%] flex gap-3'>
            <ActivityResult
              icon="bolt"
              title="Thời gian hoạt động"
              result={formatTime(data?.activeTime ? data.activeTime * 60 : 0)}
            />
            <ActivityResult
              icon="fire"
              title="Lượng calo"
              result={`${(data?.caloriesBurned ?? 0).toFixed(1)} kcal`}
            />
            <ActivityResult
              icon="gauge-high"
              title="Vận tốc tối đa"
              result={`${data?.maxSpeed ?? 0} km/h`}
            />
          </View>
        </View>
      </View>

      <View className="rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4 mt-4" style={{ backgroundColor: theme.colors.card }}>
        <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>Bản đồ hoạt động</Text>
        {locations && locations.length > 0 ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ width: '100%', height: 300 }}
            customMapStyle={theme.mode === "dark" ? darkMapStyle : lightMapStyle}
            initialRegion={{
              latitude: locations[0]?.lat ?? 21.0278,
              longitude: locations[0]?.lng ?? 105.8342,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={true}
            followsUserLocation={false}
          >
            <Polyline
              coordinates={locations.map((point: any) => ({
                latitude: point.lat,
                longitude: point.lng
              }))}
              strokeWidth={5}
              strokeColor="#007aff"
            />
            {locations.length >= 3 && (
              <Polygon
                coordinates={[
                  ...locations.map((point: any) => ({
                    latitude: point.lat,
                    longitude: point.lng
                  })),
                  {
                    latitude: locations[0].lat,
                    longitude: locations[0].lng
                  }
                ]}
                fillColor="rgba(0,122,255,0.2)"
                strokeColor="rgba(0,122,255,0.5)"
              />
            )}
            <Marker
              coordinate={{
                latitude: locations[0].lat,
                longitude: locations[0].lng
              }}
              title="Điểm bắt đầu"
            />
            {locations.length > 1 && (
              <Marker
                coordinate={{
                  latitude: locations[locations.length - 1].lat,
                  longitude: locations[locations.length - 1].lng
                }}
                title="Điểm kết thúc"
              />
            )}
          </MapView>
        ) : (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>
             Đang tải bản đồ
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
    </View>
  )
}

export default Page