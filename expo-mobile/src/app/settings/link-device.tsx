import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text, Badge } from "@/components/ui";
import { useGetInfoOnSetting } from "@/api/setting-api";
import { showGlobalDialog } from "@/components/dialog";

export default function LinkDeviceScreen() {
  const { colors, spacing } = useTheme();
  const { data: info, isLoading, refetch } = useGetInfoOnSetting();

  const sessions = info?.data?.sessionHistory || [];
  const activeSessionId = info?.data?.sessionId;

  const handleRevokeSession = (sessionId: string) => {
    if (sessionId === activeSessionId) {
      showGlobalDialog({
        title: "Action Not Allowed",
        message: "You cannot revoke your current active session from here.",
        type: "info"
      });
      return;
    }

    Alert.alert("Revoke Session", "Are you sure you want to log out from this device?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Revoke", 
        style: "destructive", 
        onPress: () => {
          // Implement revoke session API call here if available
          showGlobalDialog({ title: "Coming Soon", message: "Session management is being improved.", type: "info" });
        }
      },
    ]);
  };

  const getDeviceIcon = (os: string = "") => {
    const osLower = os.toLowerCase();
    if (osLower.includes("ios") || osLower.includes("android")) return "phone-portrait-outline";
    if (osLower.includes("windows") || osLower.includes("mac") || osLower.includes("linux")) return "desktop-outline";
    return "globe-outline";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Link a Device", headerTransparent: false }} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        
        <View style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Ionicons name="qr-code-outline" size={32} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text weight="bold" color="primary">Desktop Linking</Text>
            <Text variant="bodySmall" color="primary">
              Scan the QR code on StoreOne Web to securely link your account to a new device.
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Text variant="label" color="secondaryText" style={styles.sectionTitle}>
            ACTIVE SESSIONS ({sessions.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.secondaryBackground }]}>
            {sessions.map((session: any, index: number) => {
              const isCurrent = session.sessionId === activeSessionId;
              return (
                <View key={index}>
                  <View style={styles.sessionRow}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
                      <Ionicons 
                        name={getDeviceIcon(session.os)} 
                        size={24} 
                        color={isCurrent ? colors.primary : colors.text} 
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text weight="semibold">{session.browser || "Unknown Browser"} on {session.os || "Unknown OS"}</Text>
                        {isCurrent && (
                          <Badge label="Current" variant="success" size="sm" style={{ marginLeft: 8 }} />
                        )}
                      </View>
                      <Text variant="caption" color="secondaryText">
                        {session.ip} • {typeof session.location === 'object' ? `${session.location.city}, ${session.location.countryCode}` : (session.location || "Unknown Location")}
                      </Text>
                      <Text variant="caption" color="secondaryText">
                        Last active: {new Date(session.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    {!isCurrent && (
                      <TouchableOpacity onPress={() => handleRevokeSession(session.sessionId)}>
                        <Ionicons name="log-out-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {index < sessions.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.qrButton, { backgroundColor: colors.primary, marginTop: spacing.xl }]}
          onPress={() => showGlobalDialog({ title: "Scanner", message: "QR Scanner will open here.", type: "info" })}
        >
          <Ionicons name="scan-outline" size={24} color="white" />
          <Text weight="bold" style={{ color: "white", marginLeft: 12 }}>Scan QR Code</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    marginLeft: 12,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 1,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 76,
  },
  qrButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
