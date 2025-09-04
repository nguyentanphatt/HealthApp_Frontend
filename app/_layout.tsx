import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from 'expo-font';
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
export default function RootLayout() {
  const router = useRouter();
  const [loaded] = Font.useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
  });

  useEffect(() => {
    const checkIntroduction = async () => {
      const hasSeen = await AsyncStorage.getItem("hasSeenIntroduction");
      if (!hasSeen) {
        //router.replace("/introduction");
        router.replace('/auth/verify')
      }
    };
    checkIntroduction();
  }, []);
  
  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="introduction" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/signin" />
      </Stack>
    </>
  );
}
