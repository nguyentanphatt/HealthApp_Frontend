import { SaveWaterRecordsResponse, UpdateWaterDailyGoalResponse, UpdateWaterRecordResponse, WaterStatusResponse, WaterWeeklyResponse, WeatherResponse } from "@/constants/type";
import { privateClient, publicClient } from "./client";

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

export const updateWaterRecord = async (amount: number, oldTime:string, time: string,): Promise<UpdateWaterRecordResponse> => {
  try {
    console.log("old", oldTime);
    
    const response = await privateClient.put("/api/water/record", {
      amount,
      oldTime,
      time,
    });
    return response.data
  } catch (error) {
    throw error
  }
};

export const updateWaterDailyGoal = async (amount: number, time: string): Promise<UpdateWaterDailyGoalResponse> => {
  try {
    const response = await privateClient.post('/api/water/daily-goal', {
      amount, date: time
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getIp = async () => {
  try {
    const response = await publicClient.get("http://ipv4.icanhazip.com/");
    return response.data
  } catch (error) {
    throw error
  }
}

export const WeatherSuggest = async (ip:string): Promise<WeatherResponse> => {
  try {
    const response = await publicClient.get('/api/water/weatherai', {
      params: {
        ip
      }
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const WaterWeekly = async (options?: {
  date?: string;
}): Promise<WaterWeeklyResponse> => {
  try {
    const response = await privateClient.get("/api/stats/waterweekly", {
      params: {
        date: options?.date,
      },
    });
    return response.data
  } catch (error) {
    throw error
  }
};