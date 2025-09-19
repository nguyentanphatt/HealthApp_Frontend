import { WaterStatus, WeatherResponse } from '@/constants/type';
import { useUnits } from '@/context/unitContext';
import { convertWater } from '@/utils/convertMeasure';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const Weather = ({
  weatherReport,
  waterStatus,
  handleUpdateGoal,
}: {
  weatherReport: WeatherResponse;
  waterStatus: WaterStatus;
  handleUpdateGoal: (amount: number, time: string) => void;
}) => {
  const {units} = useUnits()
  return (
    <View className="flex flex-row items-center justify-between gap-5 bg-white rounded-md shadow-md p-4">
      <View className="flex flex-row items-center gap-2.5 max-w-[60%]">
        <View
          className="size-12 rounded-full flex items-center justify-center"
          style={{
            backgroundColor:
              weatherReport.temp > 33
                ? "#fa810720"
                : weatherReport.temp > 20
                  ? "#fae70720"
                  : "#19B1FF20",
          }}
        >
          <FontAwesome6
            name="temperature-half"
            size={24}
            color={
              weatherReport.temp > 33
                ? "#fa8107"
                : weatherReport.temp > 20
                  ? "#fae707"
                  : "#19B1FF"
            }
          />
        </View>

        <View>
          <Text className="text-xl">
            Nhiệt độ hôm nay là{" "}
            <Text className="font-bold">{weatherReport.temp}°C</Text>, độ ẩm là{" "}
            <Text className="font-bold">{weatherReport.humidity} %</Text>
          </Text>
          <Text className="text-lg text-black/60">
            Chúng tôi khuyến nghị bạn nên uống ít nhất{" "}
            <Text className="font-bold text-black">
              {convertWater(weatherReport.recommended, units.water)} {units.water}
            </Text>
          </Text>
        </View>
      </View>
      <View className="w-[40%]">
        {weatherReport.recommended <= waterStatus.dailyGoal ? (
          <TouchableOpacity
            disabled
            className="self-center flex-row items-center justify-center bg-gray-200 px-4 py-3 rounded-full"
          >
            <Text className="text-black">Thêm ngay</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() =>
              handleUpdateGoal(weatherReport.recommended, Date.now().toString())
            }
            className="self-center flex-row items-center justify-center bg-cyan-blue px-4 py-3 rounded-full"
          >
            <Text className="text-white">Thêm ngay</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Weather