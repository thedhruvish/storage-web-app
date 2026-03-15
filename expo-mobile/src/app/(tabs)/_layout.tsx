import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <NativeTabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="starred">
        <NativeTabs.Trigger.Label>Starred</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="star.fill" md="star" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="share">
        <NativeTabs.Trigger.Label>Share</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="people" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="setting">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
