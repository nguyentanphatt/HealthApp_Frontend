import { FontAwesome6 } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
interface FuctionCardProps {
    classname:string,
    iconName?:string,
    title:string,
    children: ReactNode
}
const FunctionCard = ({classname, iconName, title, children}:FuctionCardProps) => {
  return (
    <View className={classname}>
      <View className="flex flex-row items-start gap-2">
        <FontAwesome6 name={iconName} size={28} color="black" />
        <Text className="font-bold text-xl">{title}</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        {children}
      </View>
    </View>
  );
}

export default FunctionCard