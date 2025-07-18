import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  _id: string;
  name: string;
  email: string;
  profile: string;
  role: string;
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

function toBase64(obj: any) {
  return btoa(JSON.stringify(obj));
}

function fromBase64(str: string) {
  return JSON.parse(atob(str));
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),

      // 🔐 Encode before saving
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? fromBase64(str) : null;
        },
        setItem: (name, value) => {
          const str = toBase64(value);
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);

export const useUser = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  return { user, setUser, clearUser };
};
