import { DeleteFoodRecordResponse, FindFoodById, FoodRecordResponse, FoodStatistic, SaveFoodRecordResponse, UpdateFoodRecordResponse } from "@/constants/type";
import { privateClient, uploadClient } from "./client";

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
    console.log("Uploading file:", fileUri);
    console.log("Tag:", tag);
    
    const formData = new FormData();

    const filename = fileUri.split("/").pop() || `photo.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const file: any = {
      uri: fileUri,
      name: filename,
      type,
    };

    console.log("File object:", file);

    formData.append("file", file);
    if (tag) formData.append("tag", tag);

    console.log("FormData prepared, sending request...");

    const response = await uploadClient.post("/api/food/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("Upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload error details:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("Request error:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
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
