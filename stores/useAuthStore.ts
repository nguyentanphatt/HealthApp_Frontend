import { refreshNewToken } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
    setTokens: (accessToken: string, refreshToken: string) => void;
    clearTokens: () => void;
    refresh: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
      (set, get) => ({
        accessToken: null,
        refreshToken: null,
  
        setTokens: (access, refresh) => {
          set({ accessToken: access, refreshToken: refresh });
        },
  
        clearTokens: () => {
          set({ accessToken: null, refreshToken: null });
        },
  
        refresh: async () => {
          const refreshToken = get().refreshToken;
          if (!refreshToken) return;
  
          try {
            const res = await refreshNewToken(get().accessToken, get().refreshToken);
            if (!res) throw new Error("Refresh failed");
  
            set({ accessToken: res.accessToken, refreshToken: res.refreshToken });
          } catch (err) {
            console.error("Refresh error:", err);
            get().clearTokens();
          }
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
);