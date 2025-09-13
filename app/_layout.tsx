import useAuthStorage from "@/hooks/useAuthStorage";
import { useNotifications } from "@/hooks/useNotification";
import { registerForPushNotificationsAsync } from "@/utils/notificationsHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import "../global.css";

SplashScreen.preventAutoHideAsync(); // ✅ keep splash until we say so

export default function RootLayout() {
  useNotifications();
  const router = useRouter();
  const [loaded] = Font.useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
  });

  const { checkAndRefreshToken, loadStoredAuth } = useAuthStorage();
  const queryClient = new QueryClient();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    const init = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem("hasSeenIntroduction");
        console.log("🔍 hasSeenIntroduction:", hasSeen);

        if (!hasSeen) {
          console.log("➡️ Going to introduction");
          router.replace("/introduction");
          return;
        }

        const storedAccess = await SecureStore.getItemAsync("access_token");
        const storedRefresh = await SecureStore.getItemAsync("refresh_token");
        console.log("🔍 Access token:", storedAccess ? "EXISTS" : "NULL");
        console.log("🔍 Refresh token:", storedRefresh ? "EXISTS" : "NULL");

        await loadStoredAuth();
        if (storedAccess && storedRefresh) {
          console.log("➡️ Going to tabs");
          await checkAndRefreshToken(storedAccess, storedRefresh);
          router.replace("/(tabs)");

          interval = setInterval(async () => {
            const a = await SecureStore.getItemAsync("access_token");
            const r = await SecureStore.getItemAsync("refresh_token");
            if (a && r) {
              await checkAndRefreshToken(a, r);
            }
          }, 5 * 60 * 1000);
        } else {
          console.log("➡️ Going to auth/signin");
          router.replace("/auth/signin");
        }
      } catch (e) {
        console.log("❌ Error in init:", e);
        router.replace("/auth/signin");
      } finally {
        // ✅ Hide splash after everything is ready
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 300); // small delay for smooth transition
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
      if (!granted) console.log("Permission denied for notifications");
    })();
  }, []);

  if (!loaded) return null; // Splash stays while loading fonts

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#f6f6f6" },
        }}
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
