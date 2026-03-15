import KvStore from "expo-sqlite/kv-store";

export const AUTH_TOKEN_NAME = "dhrvish-token";
export const ONBOARD_STATUS = "onbaoard";

export const handleToken = {
  setToken(name: string, token: string) {
    KvStore.setItem(name, token);
  },
  getToken(name: string = AUTH_TOKEN_NAME) {
    return KvStore.getItemSync(name);
  },
  deleteToken(name: string = AUTH_TOKEN_NAME) {
    KvStore.removeItem(name);
  },
};
