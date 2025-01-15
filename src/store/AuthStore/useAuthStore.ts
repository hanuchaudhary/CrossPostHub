import { User } from "@/Types/Types";
import { create } from "zustand";
import axios from "axios";

interface AuthStore {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    registerAccount: (props: { email: string, password: string, name: string }) => Promise<void>;

    signin: (props: { email: string, password: string }) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    error: null,
    isLoading: false,
    registerAccount: async (props: { email: string, password: string, name: string }) => {
        set({ isLoading: true });
        try {
            const response = await axios.post("/api/register", props);
            const data = response.data;
            console.log("data.error: ", data);

            if (data.error) {
                set({ error: data.error });
                throw new Error(data.error);
            }
            set({ user: data.user, error: null });
        } catch (error: any) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    signin: async (props: { email: string, password: string }) => {
        set({ isLoading: true });
        try {
            const response = await axios.post("/api/signin", props);
            const data = response.data;
            console.log("data.error: ", data);

            if (data.error) {
                set({ error: data.error });
                throw new Error(data.error);
            }
            set({ user: data.user, error: null });
        } catch (error: any) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    }

}));