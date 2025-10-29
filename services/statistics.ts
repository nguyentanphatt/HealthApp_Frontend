import { FoodWeekly, ReportData, SleepWeekly, WaterWeekly, WorkoutWeekly } from "@/constants/type";
import { privateClient } from "./client";

export const weeklyReport = async (params?:{date?:number}):Promise<{success: boolean, data: ReportData}> => {
    try {
        const response = await privateClient.get("/api/stats/report", {
            params: {
                date: params?.date,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const foodWeekly = async (params?:{date?:number}):Promise<{success: boolean, data: FoodWeekly}> => {
    try {
        const response = await privateClient.get("/api/stats/fooddetail", {
            params: {
                date: params?.date,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const sleepWeekly = async (params?:{date?:number}):Promise<{success: boolean, data: SleepWeekly}> => {
    try {
        const response = await privateClient.get("/api/stats/sleepdetail", {
            params: {
                date: params?.date,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const workoutWeekly = async (params?:{date?:number}):Promise<{success: boolean, data: WorkoutWeekly}> => {
    try {
        const response = await privateClient.get("/api/stats/workoutweekly", {
            params: {
                date: params?.date,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const waterWeekly = async (params?:{date?:number}):Promise<{success: boolean, data: WaterWeekly}> => {
    try {
        const response = await privateClient.get("/api/stats/waterdetail", {
            params: {
                date: params?.date,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}