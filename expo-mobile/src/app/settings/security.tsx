import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";
import {
  useGetInfoOnSetting,
  useToggleTwoFactor,
  useDeleteTwoFactorMethod,
} from "@/api/setting-api";
import { showGlobalDialog } from "@/components/dialog";

export default function SecurityScreen() {
  const { colors, spacing } = useTheme();
  const { data: info, refetch } = useGetInfoOnSetting();
  const toggleMutation = useToggleTwoFactor();
  const deleteMutation = useDeleteTwoFactorMethod(
    info?.data?.twoFactorId || "",
  );

  const userData = info?.data;

  const handleToggle2FA = () => {
    if (!userData?.twoFactorId) {
      showGlobalDialog({
        title: "Setup Required",
        message: "Please setup 2FA through the web dashboard first.",
        type: "info",
      });
      return;
    }

    toggleMutation.mutate(userData.twoFactorId, {
      onSuccess: () => {
        showGlobalDialog({
          title: "Success",
          message: "Security setting updated",
          type: "success",
        });
        refetch();
      },
    });
  };

  const handleDeleteMethod = (id: string, name: string) => {
    Alert.alert("Delete Method", `Are you sure you want to remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              showGlobalDialog({
                title: "Success",
                message: "Method removed",
                type: "success",
              });
              refetch();
            },
          });
        },
      },
    ]);
  };

  const Separator = () => (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Security", headerTransparent: false }} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* Two-Factor Authentication Toggle */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.secondaryBackground,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text variant="h4" weight="bold">
                Two-Factor Authentication
              </Text>
              <Text variant="bodySmall" color="secondaryText">
                Add an extra layer of security to your account
              </Text>
            </View>
            <Switch
              value={userData?.isTwoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Security Methods */}
        <View style={{ marginTop: spacing.xl }}>
          <Text
            variant="label"
            color="secondaryText"
            style={styles.sectionTitle}
          >
            SECURITY METHODS
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.secondaryBackground },
            ]}
          >
            {userData?.twoFactor && userData.twoFactor.length > 0 ? (
              userData.twoFactor.map((method: any, index: number) => (
                <View key={index}>
                  <View style={styles.methodRow}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: colors.primary + "15" },
                      ]}
                    >
                      <Ionicons
                        name={
                          method.type === "totp"
                            ? "key-outline"
                            : "finger-print-outline"
                        }
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text weight="medium">
                        {method.friendlyName || "Authenticator App"}
                      </Text>
                      <Text variant="caption" color="secondaryText">
                        {method.type === "totp" ? "TOTP" : "Passkey"} • Added on{" "}
                        {new Date(method.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteMethod(
                          method.credentialID || method.friendlyName,
                          method.friendlyName || "Method",
                        )
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                  {index < userData.twoFactor.length - 1 && <Separator />}
                </View>
              ))
            ) : (
              <View style={{ padding: spacing.lg, alignItems: "center" }}>
                <Text color="secondaryText">
                  No security methods added yet.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.primary + "10", marginTop: spacing.xl },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text
            variant="bodySmall"
            color="primary"
            style={{ marginLeft: 8, flex: 1 }}
          >
            To add new security methods, please use the StoreOne web
            application.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginLeft: 12,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 1,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  infoBox: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
