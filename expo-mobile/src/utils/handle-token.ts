import KvStore from "expo-sqlite/kv-store";

export const AUTH_TOKEN_NAME = "dhrvish-token";
export const ONBOARD_STATUS = "onbaoard";

export const handleToken = {
  async setToken(name: string, token: string) {
    await KvStore.setItem(name, token);
  },
  getToken(name: string = AUTH_TOKEN_NAME) {
    return KvStore.getItem(name);
  },
  getTokenSync(name: string = AUTH_TOKEN_NAME) {
    return KvStore.getItemSync(name);
  },
  async deleteToken(name: string = AUTH_TOKEN_NAME) {
    await KvStore.removeItem(name);
  },
};
