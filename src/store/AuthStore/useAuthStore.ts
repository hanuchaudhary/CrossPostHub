import { User } from "@/Types/Types";
import { create } from "zustand";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface registerAccountProps {
  email: string;
  password: string;
  name: string;
}

interface AuthStore {
  isLoading: boolean;
  error: string | null;
  registerAccount: (
    props: registerAccountProps,
    onSuccess: () => void
  ) => Promise<void>;

  user: User | null;
  fetchUser: VoidFunction;
}

export const useAuthStore = create<AuthStore>((set) => ({
  error: null,
  isLoading: false,
  registerAccount: async (props, onSuccess) => {
    set({ isLoading: true });
    try {
      const response = await axios.post("/api/auth/register", props);

      if (response.status !== 200) {
        throw new Error("An error occurred");
      }

      onSuccess();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        set({ error: error.response?.data?.error || "An error occurred" });
        toast({
          title: "An error occurred",
          description: error.response?.data?.error || "An error occurred",
        });
      } else {
        set({ error: "An error occurred" });
        toast({
          title: "An error occurred",
          description: "An error occurred",
        });
      }
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
  },
}));
