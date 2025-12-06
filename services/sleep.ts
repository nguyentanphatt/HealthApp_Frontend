import {
  CreateSleepRecordResponse,
  SleepStatusResponse,
  SleepPointResponse,
  SleepSessionResponse,
} from "@/constants/type";
import { privateClient } from "./client";

export const getSleepStatus = async (options?: {
  date?: string;
}): Promise<SleepStatusResponse> => {
  try {
    const response = await privateClient.get("/api/sleep/status", {
      params: {
        date: options?.date,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CreateSleepRecord = async (
  start: string,
  end: string,
  allWeek: boolean
): Promise<CreateSleepRecordResponse> => {
  try {
    const response = await privateClient.post("/api/sleep/record", {
      start,
      end,
      allWeek,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const UpdateSleepRecord = async (
  recordId: string,
  options?: {
    start?: string;
    end?: string;
    qualityScore?: string;
    attribute?: string;
  }
): Promise<CreateSleepRecordResponse> => {
  try {
    const response = await privateClient.put(`/api/sleep/update/${recordId}`, options || {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveSleepPoint = async (
  type: 'sleep' | 'awake',
  time: string,
  recordId: string
): Promise<SleepPointResponse> => {
  try {
    const response = await privateClient.post("/api/sleep/point", {
      type,
      time,
      recordId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSleepSession = async (
  recordId: string
): Promise<SleepSessionResponse> => {
  try {
    const response = await privateClient.get(`/api/sleep/session/${recordId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
