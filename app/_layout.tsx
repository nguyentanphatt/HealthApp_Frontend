import useAuthStorage from "@/hooks/useAuthStorage";
import { useNotifications } from "@/hooks/useNotification";
import { registerForPushNotificationsAsync } from "@/utils/notificationsHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  useNotifications()
  const [loaded] = Font.useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
  });

  const { checkAndRefreshToken, loadStoredAuth, refreshToken } = useAuthStorage();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const queryClient = new QueryClient();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    const init = async () => {
      try {
        // Check app version để auto-reset khi update
        const currentVersion = "1.0.1"; // Thay đổi version này khi cần reset
        const storedVersion = await AsyncStorage.getItem("app_version");
        
        if (storedVersion !== currentVersion) {
          console.log("🔄 App version changed, clearing old data...");
          await AsyncStorage.clear();
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
          await AsyncStorage.setItem("app_version", currentVersion);
        }
        
        const hasSeen = await AsyncStorage.getItem("hasSeenIntroduction");
        if (!hasSeen) {
          setInitialRoute("introduction");
          return;
        }

        const storedAccess = await SecureStore.getItemAsync("access_token");
        const storedRefresh = await SecureStore.getItemAsync("refresh_token");
        console.log("token", storedAccess);
        
        await loadStoredAuth();
        if (storedRefresh && storedAccess) {
          await checkAndRefreshToken(storedAccess, storedRefresh);
          setInitialRoute("(tabs)");
          //setInitialRoute("water/index");

          interval = setInterval(
            async () => {
              const a = await SecureStore.getItemAsync("access_token");
              const r = await SecureStore.getItemAsync("refresh_token");
              if (a && r) {
                await checkAndRefreshToken(a, r);
              }
            },
            5 * 60 * 1000
          );
        } else {
          setInitialRoute("auth/signin");
        }
      } catch (e) {
        setInitialRoute("auth/signin");
      }
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const granted = await registerForPushNotificationsAsync();
      if (!granted) {
        console.log("Permission denied for notifications");
      }
    })();
  }, []);

  if (!loaded || !initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#f6f6f6" },
        }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="introduction" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="water/index" />
        <Stack.Screen name="water/edit/index" />
      </Stack>
      <Toast swipeable visibilityTime={3000} topOffset={50} />
    </QueryClientProvider>
  );
}
