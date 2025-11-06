import { useAppTheme } from '@/context/appThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
interface FuctionCardProps {
    classname:string,
    iconName?:string,
    title:string,
    children: ReactNode,
    href?:string
}
const FunctionCard = ({classname, iconName, title, href, children}:FuctionCardProps) => {
  const router = useRouter()
  const { theme } = useAppTheme();
  const handleNavigation = () => {
    if (href) {
      router.push(href as any);
    }
  }
  return (
      <TouchableOpacity className={classname} style={{ backgroundColor: theme.colors.card }} onPress={handleNavigation}>
        <View className="flex flex-row items-center gap-2">
          <FontAwesome6 name={iconName} size={28} color={theme.colors.textPrimary} />
          <Text className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{title}</Text>
        </View>
        <View className="flex-1 items-center justify-center">{children}</View>
      </TouchableOpacity>
  );
}

export default FunctionCard