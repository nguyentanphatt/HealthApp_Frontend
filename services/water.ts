import { SaveWaterRecordsResponse, WaterStatusResponse } from "@/constants/type";
import { privateClient } from "./client";

export const getWaterStatus = async (options?: {
  datetime?: string;
}): Promise<WaterStatusResponse> => {
  try {
    const response = await privateClient.get("/api/water/status", {
      params: {
        datetime: options?.datetime,
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