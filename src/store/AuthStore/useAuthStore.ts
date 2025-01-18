import { User } from "@/Types/Types";
import { create } from "zustand";
import axios from "axios";

interface registerAccountProps {
    email: string;
    password: string;
    username: string;
}


interface AuthStore {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    registerAccount: (props: registerAccountProps, onSuccess: () => void) => Promise<void>;

}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
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

            set({ user: data.user, error: null });
            onSuccess();
        } catch (error: any) {
            set({ error: error.error || "An error occurred" });
            console.error("Register Error:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));