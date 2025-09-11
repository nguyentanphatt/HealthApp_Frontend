import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getNewToken } from "./user";

const BASE_URL = "http://168.138.168.177:25565/";

export const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

export const privateClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

privateClient.interceptors.request.use(
  async (config) => {
    const storedAccess = await SecureStore.getItemAsync("access_token");
    if (storedAccess) {
      config.headers.Authorization = `Bearer ${storedAccess}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token on 401 and retry once
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

privateClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve) => {
          pendingQueue.push((token) => {
            if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(privateClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        if (!refreshToken) throw error;
        const data = await getNewToken(refreshToken);
        const newAccess = data.data?.accessToken ?? data.accessToken;
        const newRefresh = data.data?.refreshToken ?? data.refreshToken;
        if (newAccess) await SecureStore.setItemAsync("access_token", newAccess);
        if (newRefresh) await SecureStore.setItemAsync("refresh_token", newRefresh);

        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        // flush queue
        pendingQueue.forEach((cb) => cb(newAccess));
        pendingQueue = [];

        return privateClient(originalRequest);
      } catch (refreshErr) {
        pendingQueue.forEach((cb) => cb(null));
        pendingQueue = [];
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
