import { privateClient, publicClient } from "./client";

export const signup = async (email: string, password:string) => {
    try {
        const response = await publicClient.post('/api/auth/register', {
            email,
            password
        })       
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const sendOtp = async (email: string) => {
    try {
        const response = await publicClient.post("/api/auth/getOTPByEmail", {
          email,
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const verifyOtp = async (email: string, otp: string) => {
    try {
        const response = await publicClient.post("/api/auth/verifyOTP", {
          email,
          otp,
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const signin = async (email: string, password: string) => {
    try {
        const response = await publicClient.post("/api/auth/login", {
          email,
          password,
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const getNewToken = async (refreshToken: string) => {
    try {
        const response = await publicClient.post("/api/auth/refresh", {
          refreshToken,
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const updateUserInfo = async (fullName: string, dob:string, gender:string, height:number, weight:number, imageUrl:string) => {
    try {
        const response = await privateClient.put("/api/user/profile", {
        fullName,
        dob,
        gender,
        height,
        weight,
        imageUrl
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const getUserProfile = async () => {
    try {
        const response = await privateClient.get("/api/user/profile");
        return response.data
    } catch (error) {
        throw error
    }
}