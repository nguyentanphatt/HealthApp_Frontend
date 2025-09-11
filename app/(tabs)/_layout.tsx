import TabIcon from '@/components/TabIcon';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 100,
        },
        tabBarItemStyle: {
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="house" tabName="Trang chủ" />
          ),
        }}
      />
      <Tabs.Screen
        name="work"
        options={{
          title: "Tập luyện",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="dumbbell" tabName="Tập luyện" />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "Tin tức",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="newspaper" tabName="Tin tức" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Trang cá nhân",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="user" tabName="Trang cá nhân" />
          ),
        }}
      />
    </Tabs>
  );
}
