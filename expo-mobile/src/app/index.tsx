import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handleToken";
import { Redirect } from "expo-router";

export default function Index() {
  const authToken = handleToken.getToken(AUTH_TOKEN_NAME);
  if (authToken) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
