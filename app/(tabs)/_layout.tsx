import TabIcon from '@/components/TabIcon';
import { useAppTheme } from '@/context/appThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  return (
    <Tabs
      key={i18n.language}
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 100,
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
        },
        tabBarItemStyle: {
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        },
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.mode === 'dark' ? '#8a8a8a' : '#9b9b9b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("Trang chủ"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="house" tabName={t("Trang chủ")} />
          ),
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          title: t("Tập luyện"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="dumbbell" tabName={t("Tập luyện")} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: t("Cộng đồng"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="newspaper" tabName={t("Cộng đồng")} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("Trang cá nhân"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="user" tabName={t("Trang cá nhân")} />
          ),
        }}
      />
    </Tabs>
  );
}
