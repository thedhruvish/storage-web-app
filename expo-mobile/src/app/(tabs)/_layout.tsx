import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="starred">
        <NativeTabs.Trigger.Label>Starred</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="star.fill" md="star_outline" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="share">
        <NativeTabs.Trigger.Label>Shared</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="people_outline" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="trash">
        <NativeTabs.Trigger.Label>Trash</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="trash.fill" md="delete_outline" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
