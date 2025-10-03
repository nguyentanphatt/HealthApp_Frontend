import { privateClient, publicClient } from "./client";

export const signup = async (email: string, password: string) => {
  try {
    const response = await publicClient.post('/api/auth/register', {
      email,
      password
    })
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const sendOtp = async (email: string) => {
  try {
    const response = await publicClient.post("/api/auth/getOTPByEmail", {
      email,
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await publicClient.post("/api/auth/verifyOTP", {
      email,
      otp,
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const signin = async (email: string, password: string) => {
  try {
    const response = await publicClient.post("/api/auth/login", {
      email,
      password,
    });
    return response.data
  } catch (error) {
    throw error
  }
}

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    // Convert base64url → base64 then decode using atob (available in RN via polyfill)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const jsonPayload = atob(padded);
    const payload = JSON.parse(jsonPayload);
    const exp = payload.exp * 1000;
    // consider about-to-expire within 30s as expired to proactively refresh
    return Date.now() >= exp - 30_000;
  } catch (e) {
    console.warn("Invalid token format", e);
    return true;
  }
};

type newTokens = {
  accessToken: string;
  refreshToken: string;
}

export const refreshNewToken = async (accessToken: string | null, refreshToken: string | null): Promise<newTokens> => {
  if (!accessToken || isTokenExpired(accessToken)) {
    if (!refreshToken) {
      console.warn("No refresh token available");
      return { accessToken: "", refreshToken: "" };
    }

    try {
      const response = await getNewToken(refreshToken)
      const newTokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };
      /* if (newTokens.accessToken && newTokens.refreshToken) {
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
      } */
      return newTokens;
    } catch (e) {
      console.error("Error refreshing token", e);
      return { accessToken: "", refreshToken: "" };
    }
  }
  return { accessToken: accessToken || "", refreshToken: refreshToken || "" };
};

export const getNewToken = async (refreshToken: string) => {
  try {
    const response = await publicClient.post("/api/auth/refresh", {
      refreshToken,
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateUserInfo = async (fullName: string, dob: string, gender: string, height: number, weight: number, imageUrl: string) => {
  try {
    const response = await privateClient.put("/api/user/profile", {
      fullName,
      dob,
      gender,
      height,
      weight,
      imageUrl
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const getUserProfile = async () => {
  try {
    const response = await privateClient.get("/api/user/profile");
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateUserSetting = async (option?: {
  height?: string;
  weight?: string;
  water?: string;
  temp?: string;
}) => {
  try {
    const response = await privateClient.put("/api/user/settings", option || {});
    return response.data
  } catch (error) {
    throw error
  }
}

export const uploadImage = async (image: string): Promise<{success: string, imageUrl: string}> => {
  try {
    const formData = new FormData();

    if (image) {
      const filename = image.split("/").pop() || `photo.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const file: any = {
        uri: image,
        name: filename,
        type,
      };

      formData.append("file", file);
    }

    const response = await privateClient.post("/api/user/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data
  } catch (error) {
    throw error
  }
}