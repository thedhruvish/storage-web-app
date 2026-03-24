import { SFSymbol } from "expo-symbols";
import { ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

export interface OnboardingData {
  id: string;
  title: string;
  description: string;
  icon: SFSymbol;
  materialIcon: MaterialIconName;
}
export const ONBOARDING_DATA: OnboardingData[] = [
  {
    id: "1",
    title: "Welcome to StoreOne",
    description:
      "The ultimate cloud storage solution for your digital life. Simple, fast, and always accessible.",
    icon: "icloud.and.arrow.up.fill",
    materialIcon: "cloud-upload",
  },
  {
    id: "2",
    title: "Safe and Secure",
    description:
      "Your data is protected with state-of-the-art encryption. Your privacy is our top priority.",
    icon: "lock.shield.fill",
    materialIcon: "security",
  },
  {
    id: "3",
    title: "Sync Across Devices",
    description:
      "Access your files anywhere. Seamlessly sync your data between our mobile and web applications in real-time.",
    icon: "laptopcomputer.and.iphone",
    materialIcon: "devices",
  },
];
