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

  const maxByIcon = (() => {
    if (icon === 'clock') return 120; 
    if (icon === 'person-running') return 1000; 
    if (icon === 'bolt') return 500; 
    return 100; 
  })();

  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-row items-center gap-2">
        <FontAwesome6 name={icon as any} size={20} color={color} />
        <Text className="text-xl" style={{ color: theme.colors.textSecondary }}>
          <Text className="font-bold text-2xl" style={{ color: theme.colors.textPrimary }}>{index}</Text> {unit}
        </Text>
      </View>
      <ProgressBar color={color} value={Number(index) || 0} max={maxByIcon} />
    </View>
  );
};

export default ProgressItem