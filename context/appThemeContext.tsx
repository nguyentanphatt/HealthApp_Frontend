import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

type ThemePalette = {
  background: string;
  card: string;
  secondaryCard: string;
  redInfoCard: string;
  blueInfoCard: string;
  emeraldInfoCard: string;
  amberInfoCard: string;
  textPrimary: string;
  textSecondary: string;
  redText: string;
  blueText: string;
  emeraldText: string;
  amberText: string;
  border: string;
  tint: string;
  tabBarBackground: string;

};

type AppTheme = {
  mode: ThemeMode;
  colors: ThemePalette;
};

type ThemeContextValue = {
  theme: AppTheme;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
};

const STORAGE_KEY = "app.theme.mode";

const lightPalette: ThemePalette = {
  background: "#f6f6f6",
  card: "#ffffff",
  secondaryCard: "#f3f4f6",
  textPrimary: "#111111",
  redInfoCard: "#fef2f2",
  blueInfoCard: "#eff6ff",
  emeraldInfoCard: "#ecfdf5",
  amberInfoCard: "#fffbeb",
  redText: "#fb2c36",
  blueText: "#2b7fff",
  emeraldText: "#00bc7d",
  amberText: "#fd9a00",
  textSecondary: "#5a5a5a",
  border: "#e6e6e6",
  tint: "#19B1FF",
  tabBarBackground: "#ffffff",
};

const darkPalette: ThemePalette = {
  background: "#0f1115",
  card: "#161a20",
  secondaryCard: "#1d222a",
  redInfoCard: "#1d222a",
  blueInfoCard: "#1d222a",
  emeraldInfoCard: "#1d222a",
  amberInfoCard: "#1d222a",
  redText: "#fb2c36",
  blueText: "#2b7fff",
  emeraldText: "#00bc7d",
  amberText: "#fd9a00",
  textPrimary: "#ffffff",
  textSecondary: "#b5b5b5",
  border: "#2a2f3a",
  tint: "#19B1FF",
  tabBarBackground: "#12151b",
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") setModeState(saved);
      } catch {}
    })();
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const toggle = useCallback(async () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    await setMode(next);
  }, [mode, setMode]);

  const theme: AppTheme = useMemo(
    () => ({ mode, colors: mode === "light" ? lightPalette : darkPalette }),
    [mode]
  );

  const value: ThemeContextValue = useMemo(() => ({ theme, setMode, toggle }), [theme, setMode, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}

export type { AppTheme, ThemeMode, ThemePalette };


