import { useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { usePushToken } from "@/api/user-api";
import { handleToken, PUSH_TOKEN } from "@/utils/handle-token";
import { useUserStore } from "@/store/user-store";
import * as Linking from "expo-linking";
import { cancelUpload } from "@/store/upload-store";
import { router } from "expo-router";

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

// Define notification categories
const UPLOAD_CATEGORY = "upload-progress";
const ACTION_CANCEL = "cancel-upload";

Notifications.setNotificationCategoryAsync(UPLOAD_CATEGORY, [
  {
    identifier: ACTION_CANCEL,
    buttonTitle: "Cancel Upload",
    options: {
      opensAppToForeground: false,
    },
  },
]);

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

  const scheduleUploadNotification = useCallback(
    async (id: string, fileName: string) => {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: "Uploading File",
          body: `Preparing to upload ${fileName}...`,
          data: { uploadId: id, silent: true },
          categoryIdentifier: UPLOAD_CATEGORY,
          ...(Platform.OS === "android"
            ? { channelId: "uploads-progress" }
            : {}),
        },
        trigger: null,
      });
    },
    [],
  );

  const updateUploadNotification = useCallback(
    async (
      id: string,
      fileName: string,
      progress: number,
      totalSize?: string,
      directoryId?: string,
    ) => {
      const isDone = progress === 100;
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: isDone ? "Upload Complete" : `Uploading ${fileName}`,
          body: isDone
            ? `${fileName} uploaded successfully.`
            : `${progress}% of ${totalSize || "..."} uploaded`,
          data: {
            uploadId: id,
            directoryId,
            silent: true,
            isDone,
          },
          categoryIdentifier: isDone ? undefined : UPLOAD_CATEGORY,
          ...(Platform.OS === "android"
            ? { channelId: isDone ? "default" : "uploads-progress" }
            : {}),
        },
        trigger: null,
      });
    },
    [],
  );

  const dismissNotification = useCallback(async (id: string) => {
    await Notifications.dismissNotificationAsync(id);
  }, []);

  return {
    scheduleDownloadNotification,
    scheduleUploadNotification,
    updateUploadNotification,
    dismissNotification,
  };
}

export function useNotifications() {
  const { mutate: updatePushToken } = usePushToken();
  const user = useUserStore((state) => state.user);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  useNotificationScheduler();

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("downloads", {
        name: "Downloads",
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });

      Notifications.setNotificationChannelAsync("uploads-progress", {
        name: "Upload Progress",
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0],
        lightColor: "#FF231F7C",
        showBadge: false,
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
        const data = response.notification.request.content.data;

        // Handle Cancel Action
        if (response.actionIdentifier === ACTION_CANCEL) {
          if (data?.uploadId) {
            cancelUpload(data.uploadId as string);
          }
          return;
        }

        // Handle Download URL
        if (data?.url) {
          Linking.openURL(data.url as string).catch((err) => {
            console.error("Failed to open URL from notification:", err);
          });
        }

        // Handle Upload Complete click - Open Directory
        if (data?.isDone && data?.directoryId) {
          router.push(`/directory/${data.directoryId}`);
        } else if (data?.isDone && !data?.directoryId) {
          // If no directoryId, it was root
          router.push("/(tabs)");
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

  return useNotificationScheduler();
}
