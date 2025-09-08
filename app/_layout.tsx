import useAuthStorage from "@/hooks/useAuthStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [loaded] = Font.useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
  });

  const { checkAndRefreshToken, loadStoredAuth } = useAuthStorage();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem("hasSeenIntroduction");
        if (!hasSeen) {
          setInitialRoute("introduction");
          return;
        }

        const storedAccess = await SecureStore.getItemAsync("access_token");
        const storedRefresh = await SecureStore.getItemAsync("refresh_token");

        await loadStoredAuth();
        if (storedRefresh && storedAccess) {
          await checkAndRefreshToken(storedAccess, storedRefresh);
          setInitialRoute("(tabs)");
        } else {
          setInitialRoute("auth/signin");
        }
      } catch (e) {
        setInitialRoute("auth/signin");
      }
    };

    init();
  }, []);

  if (!loaded || !initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="introduction" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/signin" />
      </Stack>
      <Toast swipeable visibilityTime={3000} topOffset={50} />
    </>
  );
}
