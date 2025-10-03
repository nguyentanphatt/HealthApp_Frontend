import AppRefreshWatcher from "@/components/AppRefreshWatcher";
import GlobalModal from "@/components/GlobalModal";
import { UnitProvider } from "@/context/unitContext";
import { useNotifications } from "@/hooks/useNotification";
import { registerForPushNotificationsAsync } from "@/utils/notificationsHelper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import "../global.css";
import "../plugins/i18n";

SplashScreen.preventAutoHideAsync(); // ✅ keep splash until we say so

export default function RootLayout() {
  useNotifications();
  const [loaded] = Font.useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
  });
  const queryClient = new QueryClient();

  useEffect(() => {
    (async () => {
      const granted = await registerForPushNotificationsAsync();
      if (!granted) console.log("Permission denied for notifications");
    })();
  }, []);

  if (!loaded) return null; // Splash stays while loading fonts

  return (
    <QueryClientProvider client={queryClient}>
      <UnitProvider>
        <AppRefreshWatcher />
        <GlobalModal />
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
          <Stack.Screen name="food/index" />
        </Stack>
        <Toast swipeable visibilityTime={3000} topOffset={50} />
      </UnitProvider>
    </QueryClientProvider>
  );
}
