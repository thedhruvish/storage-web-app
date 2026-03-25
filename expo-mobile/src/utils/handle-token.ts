import { MMkvStore } from "@/lib/mmkv";

export const AUTH_TOKEN_NAME = "dhrvish-token";
export const ONBOARD_STATUS = "onbaoard";
export const PUSH_TOKEN = "push-token";

export const handleToken = {
  setToken(name: string, token: string) {
    MMkvStore.set(name, token);
  },
  getToken(name: string = AUTH_TOKEN_NAME) {
    return MMkvStore.getString(name);
  },
  deleteToken(name: string = AUTH_TOKEN_NAME) {
    MMkvStore.remove(name);
  },
  clearAll() {
    MMkvStore.clearAll();
  },
};
