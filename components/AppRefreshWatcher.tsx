import { useAuthStore } from '@/stores/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const AppRefreshWatcher = () => {
    const router = useRouter()
    const pathname = usePathname()
    const refresh = useAuthStore(state => state.refresh)
    const refreshToken = useAuthStore(state => state.refreshToken)
    const accessToken = useAuthStore(state => state.accessToken)
    const appState = useRef(AppState.currentState)
    const didInit = useRef(false)

    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;

        let interval: ReturnType<typeof setInterval> | undefined;

        const init = async () => {
            try {
                const hasSeen = await AsyncStorage.getItem("hasSeenIntroduction");
                console.log("🔍 hasSeenIntroduction:", hasSeen);

                if (!hasSeen) {
                    console.log("➡️ Going to introduction");
                    if (pathname !== "/introduction") {
                        router.replace("/introduction");
                    }
                    return;
                }

                if (refreshToken && accessToken) {
                    console.log("accesstoken", accessToken);
                    console.log("refreshToken", refreshToken);
                    
                    console.log("🔍 Refresh token found → refreshing...");
                    await refresh();
                    console.log("➡️ Going to tabs");
                    if (pathname !== "/(tabs)") {
                        router.replace("/(tabs)" as Href);
                    }

                    // interval refresh mỗi 5p
                    interval = setInterval(async () => {
                        if (useAuthStore.getState().refreshToken) {
                            await useAuthStore.getState().refresh();
                        }
                    }, 5 * 60 * 1000);
                } else {
                    console.log("➡️ Going to auth/signin");
                    if (pathname !== "/auth/signin") {
                        router.replace("/auth/signin" as Href);
                    }
                }
            } catch (e) {
                console.log("❌ Error in init:", e);
                router.replace("/auth/signin" as Href);
            } finally {
                setTimeout(() => {
                    SplashScreen.hideAsync();
                }, 300);
            }
        };

        init();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const subcription = AppState.addEventListener("change", async (nextState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextState === "active") {
                if (refreshToken) {
                    refresh()
                }
            }
            appState.current = nextState
        })
        return () => subcription.remove()

    }, [refreshToken, refresh])

    return null
}

export default AppRefreshWatcher