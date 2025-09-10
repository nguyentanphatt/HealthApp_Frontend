import axios from "axios";
import * as SecureStore from "expo-secure-store";

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
