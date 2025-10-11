import { create } from "zustand";

type User = {
    userId: string;
    fullName: string;
    dob: string;
    gender: string;
    height: number;
    weight: number;
    imageUrl: string;

}

type UserState = {
    user: User | null;
    setUser: (user: User) => void
    clearUser: () => void
}

export const useUserStore = create<UserState>()(
    (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null })
    }))