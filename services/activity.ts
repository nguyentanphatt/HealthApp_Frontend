import { Activity } from "@/constants/type";
import { TrackedPoint } from "@/utils/activityHelper";
import { privateClient } from "./client";


export const createActivity = async (data: {
  type: string;
  routeId: number;
  startTime: number;
  endTime: number;
  distanceKm: number;
  stepCount: number;
  avgSpeed: number;
  maxSpeed: number;
  kcal: number;
  totalTime: number;
  activeTime: number;
}): Promise<{success: boolean, message: string}> => {
  try {
    const response = await privateClient.post("/api/run/activity", data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const saveActivityData = async (
  type: string, 
  routeId: number, 
  startTime: number, 
  endTime: number,
  distanceKm: number, 
  stepCount: number, 
  avgSpeed: number, 
  maxSpeed: number, 
  kcal: number, 
  totalTime: number, 
  activeTime: number,
): Promise<{success: boolean, data: Activity}> => {
  try {
      const response = await privateClient.post("/api/run/activity", {
          type,
          routeId,
          startTime,
          endTime,
          distanceKm,
          stepCount,
          avgSpeed,
          maxSpeed,
          kcal,
          totalTime,
          activeTime,
      })
      return response.data
  } catch (error) {
      throw error
  }
}

export const updateActivityData = async (
  sessionId: string | number,
  data: {
    startTime?: number;
    endTime?: number;
    distanceKm: number;
    stepCount: number;
    avgSpeed: number;
    maxSpeed: number;
    kcal: number;
    totalTime: number;
    activeTime: number;
  }
): Promise<{success: boolean, message: string}> => {
  try {
    const response = await privateClient.put(`/api/run/activity/${sessionId}` , data)
    return response.data
  } catch (error) {
    throw error
  }
}


export const getActivityById = async (sessionId: string | number): Promise<{success: boolean, message: string, data: Activity}> => {
  try {
    const response = await privateClient.get(`/api/run/activity/${sessionId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const saveLocation = async (
  sessionId: string | number,
  locations: { latitude: number; longitude: number; time: number }[]
): Promise<{success: boolean, message: string}> => {
  try {
    const response = await privateClient.post(`/api/run/location`, { sessionId, locations })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllLocations = async (sessionId: string | number): Promise<{success: boolean, message: string, data: TrackedPoint[]}> => {
  try {
    const response = await privateClient.get(`/api/run/location`, { params: { sessionId } })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteAllLocations = async (sessionId: string | number): Promise<{success: boolean, message: string}> => {
  try {
    const response = await privateClient.delete(`/api/run/location/${sessionId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllActivities = async (): Promise<{success: boolean, message: string, data: Activity[]}> => {
  try {
    const response = await privateClient.get(`/api/run/activity`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllLocation = async (sessionId: string | number): Promise<{success: boolean, message: string, data: TrackedPoint[]}> => {
  try {
    const response = await privateClient.get(`/api/run/location`, { params: { sessionId } })
    return response.data
  } catch (error) {
    throw error
  }
}