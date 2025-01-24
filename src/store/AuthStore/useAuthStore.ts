import { User } from "@/Types/Types";
import { create } from "zustand";
import axios from "axios";

interface registerAccountProps {
    email: string;
    password: string;
    name: string;
}


interface AuthStore {
    isLoading: boolean;
    error: string | null;
    registerAccount: (props: registerAccountProps, onSuccess: () => void) => Promise<void>;

    user: User | null;
    fetchUser: VoidFunction;
}

export const useAuthStore = create<AuthStore>((set) => ({
    error: null,
    isLoading: false,
    registerAccount: async (props, onSuccess) => {
        set({ isLoading: true });
        try {
            const { data } = await axios.post<{ user: User; error?: string }>("/api/auth/register", props);
            if (data.error) {
                set({ error: data.error });
                return;
            }
            onSuccess();
        } catch (error: any) {
            set({ error: error.error || "An error occurred" });
            console.error("Register Error:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    user: null,
    fetchUser: async () => {
        set({ isLoading: true });
        try {
            const { data } = await axios.get("/api/me");
            set({ user: data.user });
        } catch (error: any) {
            console.error("Fetch User Error:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}));