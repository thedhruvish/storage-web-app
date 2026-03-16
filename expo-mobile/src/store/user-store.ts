import { create } from "zustand";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";

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

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    handleToken.deleteToken(AUTH_TOKEN_NAME);
    set({ user: null });
  },
}));
