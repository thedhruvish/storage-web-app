import {
  AUTH_TOKEN_NAME,
  handleToken,
  ONBOARD_STATUS,
} from "@/utils/handle-token";
import { Redirect } from "expo-router";

export default function Index() {
  const onboardingDone = handleToken.getToken(ONBOARD_STATUS);
  const authToken = handleToken.getToken(AUTH_TOKEN_NAME);

  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }

  if (authToken) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
