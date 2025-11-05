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
  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-row items-center gap-2">
        <FontAwesome6 name={icon} size={20} color={color} />
        <Text className="text-black/60 text-xl">
          <Text className="font-bold text-3xl text-black">{index}</Text> {unit}
        </Text>
      </View>
      <ProgressBar color={color} value={index} />
    </View>
  );
};

export default ProgressItem