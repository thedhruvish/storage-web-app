import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "./ui";

interface GoogleSignInButtonProps {
  onSuccess: (userInfo: any) => void;
  onError: (error: any) => void;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const { colors } = useTheme();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      onSuccess(userInfo);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
      onError(error);
    }
  };

  return (
    <Button
      variant="outline"
      onPress={signIn}
      size="lg"
      leftIcon={<Ionicons name="logo-google" size={20} color={colors.text} />}
      title="Continue with Google"
      style={{ width: "100%" }}
    />
  );
}
