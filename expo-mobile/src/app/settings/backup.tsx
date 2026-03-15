import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text, Button } from "@/components/ui";
import { showGlobalDialog } from "@/components/dialog";

export default function BackupScreen() {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Backup Data", headerTransparent: false }} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={[styles.card, { backgroundColor: colors.secondaryBackground, padding: spacing.lg }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-download-outline" size={40} color={colors.primary} />
          </View>
          <Text variant="h3" weight="bold" align="center" style={{ marginTop: spacing.md }}>
            Export Your Data
          </Text>
          <Text variant="body" color="secondaryText" align="center" style={{ marginTop: spacing.sm }}>
            Download a complete archive of your stored files and metadata. This process may take some time depending on your data size.
          </Text>
          
          <Button 
            title="Request Data Export" 
            onPress={() => showGlobalDialog({ title: "Coming Soon", message: "Data export will be available shortly.", type: "info" })}
            style={{ marginTop: spacing.xl, width: "100%" }}
          />
        </View>

        <View style={[styles.infoBox, { marginTop: spacing.lg, backgroundColor: colors.card }]}>
          <Text variant="bodySmall" color="secondaryText">
            • Your export will include all files, directory structures, and account metadata.{"\n"}
            • A download link will be sent to your registered email address once the backup is ready.{"\n"}
            • Links are valid for 24 hours for security reasons.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 24, alignItems: "center" },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(0, 122, 255, 0.1)", justifyContent: "center", alignItems: "center" },
  infoBox: { padding: 16, borderRadius: 16 }
});
