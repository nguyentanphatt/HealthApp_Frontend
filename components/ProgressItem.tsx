import { useAppTheme } from '@/context/appThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import ProgressBar from './ProgressBar';
interface ProgessItemProps {
    color: string,
    index:number,
    unit: string,
    icon: string
}
const ProgressItem = ({
  color,
  index,
  unit,
  icon,
}: ProgessItemProps) => {
  const { theme } = useAppTheme();
  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-row items-center gap-2">
        <FontAwesome6 name={icon} size={20} color={color} />
        <Text className="text-xl" style={{ color: theme.colors.textSecondary }}>
          <Text className="font-bold text-3xl" style={{ color: theme.colors.textPrimary }}>{index}</Text> {unit}
        </Text>
      </View>
      <ProgressBar color={color} value={index} />
    </View>
  );
};

export default ProgressItem