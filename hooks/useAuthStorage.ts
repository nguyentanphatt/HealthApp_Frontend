import { getNewToken } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";

const USER_KEY = "user_info";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export interface User {
  userId: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export default function useAuthStorage() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const loadStoredAuth = async (): Promise<void> => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      const storedAccess = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedAccess) setAccessToken(storedAccess);
      if (storedRefresh) setRefreshToken(storedRefresh);
    } catch (e) {
      console.error("Error loading auth data", e);
    }
  };

  const saveAuthData = async (data: AuthResponse): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    } catch (e) {
      console.error("Error saving auth data", e);
    }
  };

  const clearAuthData = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    } catch (e) {
      console.error("Error clearing auth data", e);
    }
  };

  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch (e) {
      console.warn("Invalid token format", e);
      return true;
    }
  };


  const checkAndRefreshToken = async (accessToken: string, refreshToken: string): Promise<void> => { 
    if (!accessToken || isTokenExpired(accessToken)) {
      if (!refreshToken) {
        console.warn("No refresh token available");
        return;
      }

      try {
        const response = await getNewToken(refreshToken)
        const newTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
        if (newTokens.accessToken && newTokens.refreshToken) {
          await SecureStore.setItemAsync(
            ACCESS_TOKEN_KEY,
            newTokens.accessToken
          );
          await SecureStore.setItemAsync(
            REFRESH_TOKEN_KEY,
            newTokens.refreshToken
          );
          setAccessToken(newTokens.accessToken);
          setRefreshToken(newTokens.refreshToken);
        }
      } catch (e) {
        console.error("Error refreshing token", e);
      }
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    saveAuthData,
    clearAuthData,
    checkAndRefreshToken,
    loadStoredAuth,
    isTokenExpired
  };
}
