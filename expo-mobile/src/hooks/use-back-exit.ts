import { useEffect, useRef } from "react";
import { BackHandler, ToastAndroid, Platform } from "react-native";
import { useRouter, useSegments } from "expo-router";

export const useBackExit = () => {
  const segments = useSegments();
  const router = useRouter();
  const lastBackPressed = useRef<number>(0);

  useEffect(() => {
    const onBackPress = () => {
      // Logic: Only intercept if we are on a main tab or the login screen
      // and there's no more history to go back to within the app.

      const isAtRoot = !router.canGoBack();
      const isInMainScope =
        segments[0] === "(tabs)" || segments[0] === "(auth)";

      if (isInMainScope && isAtRoot) {
        const now = Date.now();
        if (now - lastBackPressed.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressed.current = now;
        if (Platform.OS === "android") {
          ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
        }
        // Even on iOS, returning true would prevent the default behavior if applicable,
        // but iOS doesn't have a hardware back button.
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [segments, router]);
};
