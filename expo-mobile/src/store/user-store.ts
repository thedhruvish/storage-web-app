import { create } from "zustand";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "expo-sqlite/kv-store";

export type User = {
  _id: string;
  name: string;
  email: string;
  picture: string;
  rootDirId: string;
  role: string;
  maxStorageBytes: number;
  uploadLimit: number;
};

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        handleToken.deleteToken(AUTH_TOKEN_NAME);
        set({ user: null });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
