import React from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text, Button, Badge } from "@/components/ui";
import { useUserStore } from "@/store/user-store";
import { useGetRealStorage } from "@/api/user-api";
import { formatFileSize } from "@/utils/format-bytes";

export default function StorageSettingsScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useUserStore();
  const { data: storageInfo } = useGetRealStorage();

  const usedStorage = storageInfo?.data?.size || 0;
  const maxStorage = user?.maxStorageBytes || 1024 * 1024 * 1024;
  const storagePercentage = Math.min((usedStorage / maxStorage) * 100, 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Storage Settings", headerTransparent: false }} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        
        <View style={[styles.card, { backgroundColor: colors.secondaryBackground, padding: spacing.lg }]}>
          <Text variant="h3" weight="bold">Current Usage</Text>
          <View style={{ marginTop: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text weight="medium">{formatFileSize(usedStorage)}</Text>
              <Text color="secondaryText">of {formatFileSize(maxStorage)}</Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${storagePercentage}%`, backgroundColor: storagePercentage > 90 ? colors.error : colors.primary }
                ]}
              />
            </View>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.primary + "05", borderColor: colors.primary + "20", marginTop: spacing.lg }]}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text weight="bold">Cloud Optimized</Text>
            <Text variant="bodySmall" color="secondaryText">
              Your files are stored securely with high redundancy and availability.
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Text variant="label" color="secondaryText" style={{ marginLeft: 12, marginBottom: 8 }}>PLAN DETAILS</Text>
          <View style={[styles.card, { backgroundColor: colors.secondaryBackground, padding: spacing.lg }]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text variant="h4" weight="bold">Free Starter</Text>
                <Text variant="caption" color="secondaryText">Up to 500MB free storage</Text>
              </View>
              <Badge label="Current Plan" variant="secondary" />
            </View>
            
            <Button 
              title="Manage Subscription" 
              variant="outline"
              onPress={() => Linking.openURL("https://storeone.cloud/pricing")}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 20 },
  progressBarContainer: { height: 12, borderRadius: 6, width: "100%", overflow: "hidden" },
  progressBar: { height: "100%" },
  infoCard: { flexDirection: "row", padding: 16, borderRadius: 16, borderWidth: 1, alignItems: "center" }
});
