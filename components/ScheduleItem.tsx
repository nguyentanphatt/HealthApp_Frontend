import { useAppTheme } from '@/context/appThemeContext';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

const ScheduleItem = ({
  title,
  current,
  old,
  category,
  percentage,
}: {
  title: string;
  current: number;
  old: number;
  category: "calories" | "sleep" | "steps" | "water";
  percentage: number;
}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const formatData = useCallback((data: number) => {
    if (category === "calories") {
      return `${data} kcal`;
    } else if (category === "sleep") {
      const h = Math.floor(data);
      const m = Math.round((data - h) * 60);
      return `${h}h${m}m`;
    } else if (category === "steps") {
      return `${data} ${t("bước")}`;
    } else if (category === "water") {
      return `${data} ml`;
    }
  }, [category]);

  const { text, color } = useMemo(() => {
    if (percentage === 0) {
      return { text: "=", color: "#FFD700" }
    }

    if (percentage > 0) {
      return { text: `+${percentage}%`, color: "green" };
    } else {
      return { text: `${percentage}%`, color: "red" };
    }
  }, [percentage]);
  
  return (
    <View className="flex gap-1">
      <Text className="text-lg" style={{ color: theme.colors.textPrimary }}>{title}</Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{formatData(current)}</Text>
        <Text className="font-bold" style={{ color: color }}>{text}</Text>
      </View>
      <Text className="text-black/60" style={{ color: theme.colors.textSecondary }}>{t("so với tuần trước")} {formatData(old)}</Text>
    </View>
  );
};

export default ScheduleItem