import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text, MenuItem } from "@/components/ui";
import { useDangerZone } from "@/api/setting-api";
import { showGlobalDialog } from "@/components/dialog";
import { useLogout } from "@/api/auth-api";

export default function DangerZoneScreen() {
  const { colors, spacing } = useTheme();
  const dangerMutation = useDangerZone();
  const logout = useLogout();

  const handleAction = (method: "deactivate" | "wipe" | "delete") => {
    const titles = {
      deactivate: "Deactivate Account",
      wipe: "Wipe All Data",
      delete: "Delete Account Permanently",
    };

    Alert.alert(
      titles[method],
      `Are you absolutely sure? This action is ${method === "deactivate" ? "reversible by logging in again" : "PERMANENT and cannot be undone"}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          style: "destructive",
          onPress: () => {
            dangerMutation.mutate(method, {
              onSuccess: () => {
                showGlobalDialog({
                  title: "Action Complete",
                  message: "Your request has been processed.",
                  type: "success",
                });
                if (method !== "wipe") {
                  logout.mutate();
                }
              },
              onError: (error: any) => {
                showGlobalDialog({
                  title: "Action Failed",
                  message: error.response?.data?.message || "Operation failed",
                  type: "error",
                });
              },
            });
          },
        },
      ],
    );
  };

  const Separator = () => (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{ title: "Danger Zone", headerTransparent: false }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View
          style={[
            styles.warningBox,
            {
              backgroundColor: colors.error + "10",
              borderColor: colors.error + "30",
            },
          ]}
        >
          <Ionicons name="warning-outline" size={32} color={colors.error} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text weight="bold" color="error">
              Critical Actions
            </Text>
            <Text variant="bodySmall" color="secondaryText">
              These actions can result in permanent data loss. Please proceed
              with extreme caution.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.secondaryBackground,
              marginTop: spacing.xl,
            },
          ]}
        >
          <MenuItem
            label="Deactivate Account"
            subLabel="Temporarily disable your account"
            leftIcon="pause-circle-outline"
            onPress={() => handleAction("deactivate")}
            variant="danger"
          />
          <Separator />
          <MenuItem
            label="Wipe All Data"
            subLabel="Delete all stored files and folders"
            leftIcon="refresh-outline"
            onPress={() => handleAction("wipe")}
            variant="danger"
          />
          <Separator />
          <MenuItem
            label="Delete Permanently"
            subLabel="Erase account and all data forever"
            leftIcon="trash-outline"
            onPress={() => handleAction("delete")}
            variant="danger"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  warningBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  card: { borderRadius: 16, overflow: "hidden" },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
});
