import { privateClient } from "./client"


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
) => {
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
}) => {
  try {
    const response = await privateClient.post("/api/run/activity", data)
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
) => {
  try {
    const response = await privateClient.put(`/api/run/activity/${sessionId}` , data)
    return response.data
  } catch (error) {
    throw error
  }
}


export const getActivityById = async (sessionId: string | number) => {
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
) => {
  try {
    const response = await privateClient.post(`/api/run/location`, { sessionId, locations })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllLocations = async (sessionId: string | number) => {
  try {
    const response = await privateClient.get(`/api/run/location`, { params: { sessionId } })
    return response.data
  } catch (error) {
    throw error
  }
}

