import * as Device from "expo-device";
import { Platform } from "react-native";
import * as Network from "expo-network";

export interface DeviceInfo {
  deviceName: string;
  ip: string;
}

let cachedDeviceInfo: DeviceInfo | null = null;

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  if (cachedDeviceInfo) return cachedDeviceInfo;

  let deviceName = "Unknown Device";
  let ip = "0.0.0.0";

  try {
    if (Platform.OS === "android") {
      deviceName = `${Device.manufacturer} ${Device.modelName}`;
    } else {
      deviceName = Device.modelName || "iOS Device";
    }

    const networkIp = await Network.getIpAddressAsync();
    if (networkIp) {
      ip = networkIp;
    }
  } catch (error) {
    console.error("Failed to get device info:", error);
  }

  cachedDeviceInfo = {
    deviceName,
    ip,
  };

  return cachedDeviceInfo;
};
