import { CreateBlog, GetBlogsResponse } from "@/constants/type";
import { privateClient } from "./client";

export const createNewBlog = async (title:string, image:string, content:string, createAt:number, category:string):Promise<CreateBlog> => {
    try {
        const formData = new FormData();
        
        formData.append("title", title);
        formData.append("content", content);
        formData.append("createAt", createAt.toString());
        formData.append("category", category);
        
        if (image) {
            const filename = image.split("/").pop() || `photo.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            const file: any = {
                uri: image,
                name: filename,
                type,
            };
            
            formData.append("file", file);
        }
  
        const response = await privateClient.post("/api/blog", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getBlogs = async (options?: {category?:string, page?:number, heart?:string}):Promise<GetBlogsResponse> => {
    try {
        const response = await privateClient.get("/api/blog", {
            params: options
        })
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getBlogById = async (id: string):Promise<GetBlogsResponse> => {
    try {
        const response = await privateClient.get(`/api/blog/${id}`)
        return response.data
    } catch (error) {
        throw error
    }

}

export const getBlogsByUserId = async (optional?:{page?:number, heart?:string}):Promise<GetBlogsResponse> => {
    try {
        const response = await privateClient.get("/api/blog/user", {
            params: optional
        })
        return response.data
    } catch (error) {
        throw error
    }
}