import AppRefreshWatcher from "@/components/AppRefreshWatcher";
import GlobalModal from "@/components/GlobalModal";
import { ThemeProvider, useAppTheme } from "@/context/appThemeContext";
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

SplashScreen.preventAutoHideAsync();

function InnerRoot() {
  useNotifications();
  const [loaded] = Font.useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
  });
  const queryClient = new QueryClient();
  const { theme } = useAppTheme();

  useEffect(() => {
    (async () => {
      const granted = await registerForPushNotificationsAsync();
      if (!granted) console.log("Permission denied for notifications");
    })();
  }, []);

  if (!loaded) return null;

  return (
      <QueryClientProvider client={queryClient}>
        <UnitProvider>
          <AppRefreshWatcher />
          <GlobalModal />
          <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="introduction" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/signin" />
            <Stack.Screen name="water/index" />
            <Stack.Screen name="water/edit/index" />
            <Stack.Screen name="food/index" />
          </Stack>
          <Toast swipeable visibilityTime={3000} topOffset={50} autoHide={true} />
        </UnitProvider>
      </QueryClientProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerRoot />
    </ThemeProvider>
  );
}
