import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "StoreOne",
  slug: "StoreOne",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icons/adaptive-icon.png",
  scheme: "storeone",
  userInterfaceStyle: "automatic",
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.png",
      monochromeImage: "./assets/icons/notification-icon.png",
      backgroundColor: "#ffffff",
    },
    predictiveBackGestureEnabled: false,
    package: "com.dhruvish.storeone",
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.READ_MEDIA_AUDIO",
      "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "links.storeone.cloud",
            pathPrefix: "/link-devices",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    googleServicesFile: process.env.PROD_GOOGLE_SERVICES_JSON,
  },
  ios: {
    bundleIdentifier: "com.dhruvish.storeone",
    supportsTablet: true,
    associatedDomains: ["applinks:links.storeone.cloud"],
  },
  web: {
    output: "static",
    favicon: "./assets/icons/favicon.png",
  },
  plugins: [
    "expo-router",
    ["expo-web-browser"],
    [
      "expo-notifications",
      {
        icon: "./assets/icons/notification-icon.png",
        color: "#ffffff",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash-icon.png",
        backgroundColor: "#ffffff",
        imageWidth: 200,
        resizeMode: "contain",
        dark: {
          image: "./assets/icons/splash-icon-dark.png",
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-sqlite",
    "expo-sharing",
    [
      "expo-media-library",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
        isUsageDescriptionRequired: true,
      },
    ],
    ["@react-native-google-signin/google-signin"],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
        recordAudioPermission:
          "Allow $(PRODUCT_NAME) to access your microphone",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos",
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
      },
    ],
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "storeone-mobile",
        organization: "thedhruvish",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "0c249d6e-b405-4a81-a62b-49086290aec6",
    },
  },
});
