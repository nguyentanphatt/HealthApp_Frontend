import {
  SaveWaterRecordsResponse,
  UpdateWaterDailyGoalResponse,
  UpdateWaterRecordResponse,
  UpdateWaterReminderResponse,
  WaterRecords,
  WaterReminderResponse,
  WaterStatusResponse,
  WaterWeeklyResponse,
  WeatherResponse,
} from "@/constants/type";
import { privateClient, publicClient, uploadClient } from "./client";

export const getWaterStatus = async (options?: {
  date?: string;
}): Promise<WaterStatusResponse> => {
  try {
    const response = await privateClient.get("/api/water/status", {
      params: {
        date: options?.date,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveWaterRecord = async (
  amount: number,
  time: string
): Promise<SaveWaterRecordsResponse> => {
  try {
    const response = await privateClient.post("/api/water/record", {
      amount,
      time,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWaterRecord = async (
  amount: number,
  oldTime: string,
  time: string
): Promise<UpdateWaterRecordResponse> => {
  try {
    console.log("old", oldTime);

    const response = await privateClient.put("/api/water/record", {
      amount,
      oldTime,
      time,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWaterDailyGoal = async (
  amount: number,
  time: string
): Promise<UpdateWaterDailyGoalResponse> => {
  try {
    const response = await privateClient.post("/api/water/daily-goal", {
      amount,
      date: time,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getIp = async () => {
  try {
    const response = await publicClient.get("http://ipv4.icanhazip.com/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const WeatherSuggest = async (ip: string): Promise<WeatherResponse> => {
  try {
    const response = await publicClient.get("/api/water/weatherai", {
      params: {
        ip,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const WaterWeekly = async (options?: {
  date?: string;
}): Promise<WaterWeeklyResponse> => {
  try {
    const response = await privateClient.get("/api/stats/waterweekly", {
      params: {
        date: options?.date,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWaterReminder = async (): Promise<WaterReminderResponse> => {
  try {
    const response = await privateClient.get("/api/water/reminders");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createWaterReminder = async (
  message: string,
  expiresIn: string,
  enabled: true,
): Promise<WaterReminderResponse> => {
  try {
    const response = await privateClient.post("/api/water/reminders", {
      message,
      expiresIn,
      enabled,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWaterReminder = async (
  reminderId: string,
  message: string,
  expiresIn: string,
  enabled: boolean
): Promise<UpdateWaterReminderResponse> => {
  try {
    const response = await privateClient.put("/api/water/reminders", {
      reminderId,
      message,
      expiresIn,
      enabled,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitWaterAI = async (
  fileUri: string,
): Promise<{success: boolean, message: string, data: WaterRecords}> => {
  try {
    console.log("Uploading file:", fileUri);
    
    const formData = new FormData();

    const filename = fileUri.split("/").pop() || `photo.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const file: any = {
      uri: fileUri,
      name: filename,
      type,
    };

    console.log("File object:", file);

    formData.append("file", file);

    console.log("FormData prepared, sending request...");

    const response = await uploadClient.post("/api/water/waterai", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("Upload response:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};