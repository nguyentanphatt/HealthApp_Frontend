import { WaterStatus, WeatherResponse } from '@/constants/type';
import { useAppTheme } from '@/context/appThemeContext';
import { useUnits } from '@/context/unitContext';
import { convertTemperature, convertWater } from '@/utils/convertMeasure';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  return (
    <View className="flex flex-row items-center justify-between gap-10 rounded-md shadow-md p-4" style={{ backgroundColor: theme.colors.card }}>
      <View className="flex flex-row items-center gap-2.5 max-w-[55%]">
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
          <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>
            {t("Nhiệt độ hôm nay là")} {" "}
            <Text className="font-bold">{convertTemperature(weatherReport.temp, units.temperature)}°{units.temperature}</Text>, {t("độ ẩm là")} {" "}
            <Text className="font-bold">{weatherReport.humidity} %</Text>
          </Text>
          <Text className="text-lg" style={{ color: theme.colors.textSecondary }}>
            {t("Chúng tôi khuyến nghị bạn nên uống ít nhất")} {" "}
            <Text className="font-bold" style={{ color: theme.colors.textPrimary }}>
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
            <Text className="text-white" style={{ color: theme.colors.textPrimary }}>{t("Thêm ngay")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() =>
              handleUpdateGoal(weatherReport.recommended, Date.now().toString())
            }
            className="self-center flex-row items-center justify-center bg-cyan-blue px-4 py-3 rounded-full"
          >
            <Text className="text-white" style={{ color: theme.colors.textPrimary }}>{t("Thêm ngay")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Weather