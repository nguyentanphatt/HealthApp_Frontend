import { client } from "./client";

export const signup = async (email: string, password:string) => {
    try {
        const response = await client.post('/api/auth/register', {
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
        const response = await client.post('/api/auth/getOTPByEmail', {email})
        return response.data
    } catch (error) {
        throw error
    }
}

export const verifyOtp = async (email: string, otp: string) => {
    try {
        const response = await client.post('/api/auth/verifyOTP', {email, otp})
        return response.data
    } catch (error) {
        throw error
    }
}

export const signin = async (email: string, password: string) => {
    try {
        const response = await client.post('/api/auth/login', {email, password})
        return response.data
    } catch (error) {
        throw error
    }
}

export const getNewToken = async (refreshToken: string) => {
    try {
        const response = await client.post('/api/auth/refresh', {refreshToken})
        return response.data
    } catch (error) {
        throw error
    }
}