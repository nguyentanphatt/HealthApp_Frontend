import { VideoType } from "@/constants/type";
import { privateClient, uploadClient } from "./client";

export const workoutSurvey = async (
    data: { questions: { id: number | string, question: string, answer: string }[] }
): Promise<{ success: boolean, category: string }> => {
    try {
        const response = await uploadClient.post('/api/workout/survey', data);
        return response.data;
    } catch (error) {
        throw error
    }

}


export const getWorkoutVideo = async (params: {page?: number, limit?: number}): Promise<{success: boolean, videos: VideoType[]}> =>{
    try {
        const response = await privateClient.get('/api/workout/videos', {
            params
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getWorkoutVideoById = async (id: string): Promise<{success: boolean, video: VideoType}> =>{
    try {
        const response = await privateClient.get(`/api/workout/video`, {
            params: {
                v: id
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const resetWorkoutVideo = async ():Promise<{success: boolean, message: string}> => {
    try {
        const response = await privateClient.delete('/api/workout/reset');
        return response.data;
    } catch (error) {
        throw error;
    }
}
