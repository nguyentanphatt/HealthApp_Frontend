import ActivityResult from '@/components/ActivityResult'
import { deleteAllLocations, saveLocation, updateActivityData } from '@/services/activity'
import { TrackedPoint, formatDistance, formatTime } from '@/utils/activityHelper'
import { formatDateTimeRange } from '@/utils/convertTime'
import { FontAwesome6 } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks'
import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps'

type Data = {
  distance: number;
  stepCount: number;
  positions: TrackedPoint[];
  avgSpeed: number;
  currentSpeed: number;
  maxSpeed: number;
  caloriesBurned: number;
  startTime: number | null;
  elapsed: number;
  activeTime: number;
  endTime: string;
  Date: string;
  sessionId: string | null;
}

const Page = () => {
  const { type } = useLocalSearchParams()
  const router = useRouter()
  const mapRef = useRef<MapView | null>(null);
  const [data, setData] = useState<Data>();



  useEffect(() => {
    const getData = async () => {
      try {
        const distance = await AsyncStorage.getItem('distance');
        const stepCount = await AsyncStorage.getItem('stepCount');
        const positions = await AsyncStorage.getItem('positions');
        const avgSpeed = await AsyncStorage.getItem('avgSpeed');
        const currentSpeed = await AsyncStorage.getItem('currentSpeed');
        const maxSpeed = await AsyncStorage.getItem('maxSpeed');
        const caloriesBurned = await AsyncStorage.getItem('caloriesBurned');
        const startTime = await AsyncStorage.getItem('startTime');
        const elapsed = await AsyncStorage.getItem('elapsed');
        const activeTime = await AsyncStorage.getItem('activeTime');
        const endTime = await AsyncStorage.getItem('endTime');
        const date = await AsyncStorage.getItem('Date');
        const sessionId = await AsyncStorage.getItem('activity_session_id');

        const activityData: Data = {
          distance: parseFloat(distance || '0'),
          stepCount: parseInt(stepCount || '0'),
          positions: positions ? JSON.parse(positions) : [],
          avgSpeed: parseFloat(avgSpeed || '0'),
          currentSpeed: parseFloat(currentSpeed || '0'),
          maxSpeed: parseFloat(maxSpeed || '0'),
          caloriesBurned: parseFloat(caloriesBurned || '0'),
          startTime: startTime ? parseInt(startTime) : null,
          elapsed: parseInt(elapsed || '0'),
          activeTime: parseInt(activeTime || '0'),
          endTime: endTime || '',
          Date: date || '',
          sessionId: sessionId || null
        };

        setData(activityData);

        // Fit map to show all positions
        if (activityData.positions && activityData.positions.length > 0) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(activityData.positions, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }, 1000);
        }

        // Ensure startTime is a number, fallback to 0 if null
        const safeStartTime = activityData.startTime !== null ? activityData.startTime : 0;
        // Ensure endTime is a string that can be parsed to a number, fallback to 0 if invalid
        const safeEndTime = typeof activityData.endTime === 'string' && activityData.endTime !== '' ? parseInt(activityData.endTime) : 0;
        try {
          console.log('Attempting to save activity data...');
          console.log('startTime', safeStartTime);
          console.log('endTime', safeEndTime);
          console.log('distance', activityData.distance);
          console.log('stepCount', activityData.stepCount);
          console.log('avgSpeed', activityData.avgSpeed);
          console.log('maxSpeed', activityData.maxSpeed);
          console.log('caloriesBurned', activityData.caloriesBurned);
          console.log("totalTime", activityData.elapsed);
          console.log("activeTime", activityData.activeTime);
          console.log('positions', activityData.positions);
          
          if (sessionId) {
            const response = await updateActivityData(sessionId, {
              startTime: safeStartTime,
              endTime: safeEndTime,
              distanceKm: activityData.distance,
              stepCount: activityData.stepCount,
              avgSpeed: activityData.avgSpeed,
              maxSpeed: activityData.maxSpeed,
              kcal: Number(activityData.caloriesBurned.toFixed(1)),
              totalTime: activityData.elapsed,
              activeTime: activityData.activeTime,
            });

            await deleteAllLocations(sessionId);
            await saveLocation(sessionId, activityData.positions);
            console.log('response after update', response);
            console.log('Activity data saved successfully!');
            AsyncStorage.removeItem('activity_session_id').catch(() => {});
          }

        } catch (saveError) {
          console.error('Failed to save activity data:', saveError);
        }

      } catch (error) {
        console.error('Error loading activity data:', error);
      }
    };

    getData();
  }, []);



  return (
    <ScrollView
      className="flex-1 px-4 font-lato-regular bg-[#f6f6f6]"
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex flex-row items-center justify-between bg-[#f6f6f6] pt-16 pb-10">
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <FontAwesome6 name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold  self-center">Kết quả</Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4 mt-4">
        <Text className="text-lg text-black/60">{formatDateTimeRange(data?.startTime || null, data?.endTime || '')}</Text>
        <View className="flex-row items-center justify-center mt-3 ">
          <View className='border-4 border-[#19B1FF] w-[70px] h-[70px] rounded-full p-2 items-center justify-center'>
            <FontAwesome6 name="person-running" size={28} color="#19B1FF" />
          </View>
        </View>
        <Text className="text-3xl text-black font-bold text-center">
          {formatDistance(data?.distance || 0)}
        </Text>
      </View>

      <View className="bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4 mt-4">
        <Text className="text-lg text-black/60">Thông tin chi tiết</Text>
        <View className='flex-row items-center justify-between'>
          <View className='w-[45%] flex gap-3'>
            <ActivityResult
              icon="clock"
              title="Tổng thời gian"
              result={formatTime((data?.elapsed ? data.elapsed * 60 : 0))}
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

      <View className="bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4 mt-4">
        <Text className="text-lg text-black/60">Bản đồ hoạt động</Text>
        <MapView
          ref={mapRef}
          style={{ width: '100%', height: 300 }}
          initialRegion={{
            latitude: data?.positions?.[0]?.latitude ?? 21.0278,
            longitude: data?.positions?.[0]?.longitude ?? 105.8342,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={true}
          followsUserLocation={false}
        >
          {data?.positions && data.positions.length > 0 && (
            <>
              <Polyline
                coordinates={data.positions}
                strokeWidth={5}
                strokeColor="#007aff"
              />
              {data.positions.length >= 3 && (
                <Polygon
                  coordinates={[...data.positions, data.positions[0]]}
                  fillColor="rgba(0,122,255,0.2)"
                  strokeColor="rgba(0,122,255,0.5)"
                />
              )}
              <Marker
                coordinate={data.positions[0]}
                title="Điểm bắt đầu"
              />
              {data.positions.length > 1 && (
                <Marker
                  coordinate={data.positions[data.positions.length - 1]}
                  title="Điểm kết thúc"
                />
              )}
            </>
          )}
        </MapView>
      </View>

      <View className="bg-white rounded-md shadow-md flex justify-between gap-2 w-full px-4 py-4 mt-4 h-[300px]">
      </View>
    </ScrollView>
  )
}

export default Page