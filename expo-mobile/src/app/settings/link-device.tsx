import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Platform } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";
import { useGetInfoOnSetting } from "@/api/setting-api";
import { showGlobalDialog } from "@/components/dialog";
import { SessionItem } from "@/components/link-device/SessionItem";
import { Scanner } from "@/components/link-device/Scanner";

export default function LinkDeviceScreen() {
  const { colors, spacing } = useTheme();
  const { data: info, isLoading, refetch } = useGetInfoOnSetting();
  const [isScannerVisible, setIsScannerVisible] = useState(false);

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
          showGlobalDialog({ title: "Coming Soon", message: "Session management is being improved.", type: "info" });
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Link a Device", headerTransparent: false }} />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={[styles.infoCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
        >
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="qr-code-outline" size={32} color="white" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text weight="bold" variant="h3" color="primary">Desktop Linking</Text>
            <Text variant="bodySmall" color="secondaryText" style={{ marginTop: 4 }}>
              Scan the QR code on StoreOne Web to securely link your account to a new device.
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          style={{ marginTop: spacing.xl }}
        >
          <View style={styles.sectionHeader}>
            <Text variant="label" color="secondaryText" style={styles.sectionTitle}>
              ACTIVE SESSIONS ({sessions.length})
            </Text>
            {isLoading && <Text variant="caption" color="primary">Updating...</Text>}
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.secondaryBackground }]}>
            {sessions.length > 0 ? (
              sessions.map((session: any, index: number) => (
                <View key={session.sessionId || index}>
                  <SessionItem 
                    session={session}
                    isCurrent={session.sessionId === activeSessionId}
                    index={index}
                    onRevoke={handleRevokeSession}
                  />
                  {index < sessions.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="shield-checkmark-outline" size={48} color={colors.secondaryText} />
                <Text color="secondaryText" style={{ marginTop: 12 }}>No other active sessions found.</Text>
              </View>
            )}
          </View>
          
          <Text variant="caption" color="secondaryText" style={styles.footerHint}>
            Make sure you are on the official StoreOne website before scanning.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button Container */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.qrButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsScannerVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="scan-outline" size={24} color="white" />
          <Text weight="bold" style={{ color: "white", marginLeft: 12 }}>Link a Device</Text>
        </TouchableOpacity>
      </View>

      <Scanner 
        isVisible={isScannerVisible} 
        onClose={() => setIsScannerVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the fixed button
  },
  infoCard: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 76,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20, // Handle safe area for iOS
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  qrButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 28, // Rounded pill shape
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  footerHint: {
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 40,
    opacity: 0.6,
  },
});


