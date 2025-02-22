//so basicly we need to store the image an persist it in local storage so that we can create a new option in image export as send via crossposthub 

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ImageStore {
  imageData: string;
  setImageData: (imageData: string) => void;
  clearImageData: () => void;
}

export const useImageStore = create<ImageStore>()(
  persist(
    (set) => ({
      imageData: "",
      setImageData: (imageData) => set({ imageData }),
      clearImageData: () => set({ imageData: "" }),
    }),
    {
      name: "image-storage", // storage key
    }
  )
);