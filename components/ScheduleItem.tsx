import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

const ScheduleItem = ({
  title,
  current,
  old,
  icon,
  iconColor,
}: {
  title: string;
  current: string;
  old: string;
  icon: string;
  iconColor: string;
}) => {
  const { t } = useTranslation();
  return (
    <View className="flex gap-1">
      <Text className="text-lg text-black">{title}</Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-2xl font-bold text-black">{current}</Text>
        <FontAwesome6 name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-black/60">{t("so với tuần trước")} {old}</Text>
    </View>
  );
};

export default ScheduleItem