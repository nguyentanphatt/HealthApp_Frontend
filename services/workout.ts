import { VideoType } from "@/constants/type";
import { privateClient } from "./client";

export const workoutSurvey = async (
    data: { questions: { id: number | string, question: string, answer: string }[] }
): Promise<{ success: boolean, category: string }> => {
    try {
        const response = await privateClient.post('/api/workout/survey', data);
        return response.data;
    } catch (error) {
        throw error
    }

}


export const getWorkoutVideo = async (keyword: string): Promise<{success: boolean, videos: VideoType[]}> =>{
    try {
        const response = await privateClient.post('/api/workout/videos', {
            keyword
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
