import { LatLng } from "@/utils/activityHelper"
import { privateClient } from "./client"


export const saveActivityData = async (type: string, routeId: number, startTime: number, endTime: number,
    distanceKm: number, stepCount: number, avgSpeed: number, maxSpeed: number, kcal: number, totalTime: number, activeTime: number, positions: LatLng[]
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
            positions
        })
        return response.data
    } catch (error) {
        throw error
    }
}