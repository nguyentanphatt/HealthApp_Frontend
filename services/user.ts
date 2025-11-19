import { NewTokens, OtpData, User, UserProfile, UserSetting, WeeklyGoal } from "@/constants/type";
import { privateClient, publicClient } from "./client";

export const signup = async (email: string, password: string):Promise<{success:boolean,message:string, userId:string}> => {
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

export const sendOtp = async (email: string):Promise<{success:boolean,message:string, otpExpiresIn:number}> => {
  try {
    const response = await publicClient.post("/api/auth/getOTPByEmail", {
      email,
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const verifyOtp = async (email: string, otp: string):Promise<{success:boolean,message:string, data:OtpData}> => {
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

export const signin = async (email: string, password: string):Promise<{success:boolean,message:string, userId:string}> => {
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

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const jsonPayload = atob(padded);
    const payload = JSON.parse(jsonPayload);
    const exp = payload.exp * 1000;

    return Date.now() >= exp - 30_000;
  } catch (e) {
    console.warn("Invalid token format", e);
    return true;
  }
};

export const refreshNewToken = async (accessToken: string | null, refreshToken: string | null): Promise<NewTokens> => {
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
      return newTokens;
    } catch (e) {
      console.error("Error refreshing token", e);
      return { accessToken: "", refreshToken: "" };
    }
  }
  return { accessToken: accessToken || "", refreshToken: refreshToken || "" };
};

export const getNewToken = async (refreshToken: string):Promise<{success:boolean, message:string, data:OtpData}> => {
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

export const getUserProfile = async ():Promise<UserProfile> => {
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
  lang?: string;
  theme?: string;
}) => {
  try {
    const response = await privateClient.put("/api/user/settings", option || {});
    return response.data
  } catch (error) {
    throw error
  }
}

export const getUserSetting = async ():Promise<UserSetting> => {
  try {
    const response = await privateClient.get("/api/user/settings");
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

export const getWeeklyGoal = async (option?:{date?:string}):Promise<{success:boolean,data:WeeklyGoal}> => {
  try {
    const response = await privateClient.get("/api/stats/weekly", {
      params: {
        date: option?.date,
      },
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const verifyResetPassword = async (email: string, otp: string):Promise<{success:boolean,message:string}> => {
  try {
    const response = await publicClient.post("/api/auth/verify-reset-otp", {
      email,
      otp,
    });
    return response.data
  } catch (error) {
    throw error
  }
}


export const changePassword = async ({
  email,
  newPassword,
}: {
  email: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await publicClient.post("/api/auth/reset-password", {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInfoUserLogin = async ():Promise<{success:boolean, data: {userId:string, email:string}}> => {
  try {
    const response = await privateClient.get("/api/auth/me");
    return response.data
  } catch (error) {
    throw error
  }
}

export const googleSigninAPI = async (name: string, email: string, imageUrl: string):Promise<{success:boolean, message:string, data: {
  accessToken: string;
  refreshToken: string;
  user: User;
}}> => {
  try {
    const response = await publicClient.post("/api/auth/google", {
      name,
      email,
      imageUrl,
    });
    return response.data
  } catch (error) {
    throw error
  }
}