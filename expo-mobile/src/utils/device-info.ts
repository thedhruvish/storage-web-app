import * as Device from "expo-device";
import { Platform } from "react-native";

export interface DeviceInfo {
  deviceName: string;
  ip: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  let deviceName = "Unknown Device";
  let ip = "Unknown IP";

  if (Platform.OS === "android") {
    deviceName = `${Device.manufacturer} ${Device.modelName}`;
  } else {
    deviceName = Device.modelName || "iOS Device";
  }

  return {
    deviceName,
    ip,
  };
};
