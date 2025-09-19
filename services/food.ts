import { DeleteFoodRecordResponse, FindFoodById, FoodRecordResponse, FoodStatistic, SaveFoodRecordResponse, UpdateFoodRecordResponse } from "@/constants/type";
import { privateClient } from "./client";

export const getFoodStatus = async (option?: {
  date?: string;
}): Promise<FoodRecordResponse> => {
  try {
    const response = await privateClient.get("/api/food/status", {
      params: { date: option?.date },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitFoodRecord = async (
  fileUri: string,
  tag?: string
): Promise<SaveFoodRecordResponse> => {
  try {
    const formData = new FormData();

    const filename = fileUri.split("/").pop() || `photo.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const file: any = {
      uri: fileUri,
      name: filename,
      type,
    };

    formData.append("file", file);
    if (tag) formData.append("tag", tag);

    const response = await privateClient.post("/api/food/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const foodWeekly = async (option?:{date?:string}):Promise<FoodStatistic> => {
  try {
    const response = await privateClient.get('/api/stats/caloriesweekly', {
      params: { date: option?.date },
    })
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getFoodById = async (id:string):Promise<FindFoodById> => {
  try {
    const response = await privateClient.get(`/api/food/${id}`)
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const deleteFoodRecordById = async (id:string):Promise<DeleteFoodRecordResponse> => {
  try {
    const response = await privateClient.delete(`/api/food/delete/${id}`)
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateFoodRecord = async (
  recordId: string,
  loggedAt?: string,
  tag?: string
): Promise<UpdateFoodRecordResponse> => {
  try {
    const response = await privateClient.put(`/api/food/edit/${recordId}`, {
      loggedAt,
      tag,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
