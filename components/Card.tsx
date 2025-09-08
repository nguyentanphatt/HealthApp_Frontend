import { FontAwesome6 } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface CardProps {
    title: string,
    subtitle?:string,
    setting?: boolean,
    children: ReactNode,
    icon?:string
}

const Card = ({title, subtitle, setting = false, icon, children}: CardProps) => {
  return (
    <View className="bg-white rounded-md shadow-md flex justify-between gap-5 w-full px-4 py-4">
      <View className="flex flex-row items-center justify-between">
        <View className="flex">
          <Text className="font-bold text-xl">{title}</Text>
          {subtitle && <Text className="text-black/60">{subtitle}</Text>}
        </View>
        {setting && <FontAwesome6 name={icon} size={20} color="black" />}
      </View>
      {children}
    </View>
  );
}

export default Card