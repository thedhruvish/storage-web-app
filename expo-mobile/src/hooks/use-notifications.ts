import { useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { usePushToken } from "@/api/user-api";
import { handleToken, PUSH_TOKEN } from "@/utils/handle-token";
import { useUserStore } from "@/store/user-store";
import * as Linking from "expo-linking";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isSilent = notification.request.content.data?.silent;
    return {
      shouldPlaySound: !isSilent,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export function useNotificationScheduler() {
  const scheduleDownloadNotification = useCallback(
    async (fileName: string, uri: string) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Download Complete",
          body: `${fileName} has been downloaded.`,
          data: { url: uri, silent: true },
          categoryIdentifier: "download",
          ...(Platform.OS === "android" ? { channelId: "downloads" } : {}),
        },
        trigger: null,
      });
    },
    [],
  );

  return { scheduleDownloadNotification };
}

export function useNotifications() {
  const { mutate: updatePushToken } = usePushToken();
  const user = useUserStore((state) => state.user);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const { scheduleDownloadNotification } = useNotificationScheduler();

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("downloads", {
        name: "Downloads",
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (!user) return;

    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log("Project ID not found in expo config");
        return;
      }

      try {
        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        const oldToken = handleToken.getToken(PUSH_TOKEN);
        console.log(token);
        if (token !== oldToken) {
          updatePushToken(token);
        }
      } catch (e) {
        console.log("Error getting push token", e);
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }

    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Response:", response);
        const url = response.notification.request.content.data?.url as string;
        if (url) {
          Linking.openURL(url).catch((err) => {
            console.error("Failed to open URL from notification:", err);
          });
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user, updatePushToken]);

  return { scheduleDownloadNotification };
}
