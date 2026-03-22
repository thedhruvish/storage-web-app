import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Share,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTheme } from "@/hooks/use-theme";
import { Text, MenuItem, Button, Badge } from "@/components/ui";
import { useUserStore } from "@/store/user-store";
import { useLogout } from "@/api/auth-api";
import { useGetRealStorage, getCurrentUser } from "@/api/user-api";
import { formatFileSize } from "@/utils/format-bytes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDialog } from "@/components/dialog";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const PRICING_URL = "https://storeone.cloud/pricing";
const WEBSITE_URL = "https://storeone.cloud";
const LINKEDIN_URL = "https://linkedin.com/in/dhruvishlathiya";
const X_URL = "https://x.com/dhruvishlathiya";
const APP_SHARE_MESSAGE =
  "Check out StoreOne - Your secure cloud storage! " + WEBSITE_URL;

export default function SettingScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const logout = useLogout();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const { showDialog } = useDialog();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: storageInfo, refetch: refetchStorage } = useGetRealStorage();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data and storage info in parallel
      const [userRes] = await Promise.all([getCurrentUser(), refetchStorage()]);

      if (userRes.data) {
        setUser(userRes.data);
      }
    } catch (error) {
      console.error("Failed to refresh settings:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    showDialog({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: async () => {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        logout.mutate();
      },
    });
  };

  const handleUpgrade = () => {
    Linking.openURL(PRICING_URL);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: APP_SHARE_MESSAGE,
        url: WEBSITE_URL,
      });
    } catch (error) {
      console.error("Error sharing app:", error);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

  const usedStorage = storageInfo?.data?.size || 0;
  const maxStorage = user?.maxStorageBytes || 1024 * 1024 * 1024; // Default 1GB
  const storagePercentage = Math.min((usedStorage / maxStorage) * 100, 100);

  const Separator = () => (
    <View
      style={[
        styles.separator,
        { backgroundColor: colors.border, marginLeft: 56 },
      ]}
    />
  );

  const navigateToWebView = (url: string, title: string) => {
    setIsMenuVisible(false);
    router.push({
      pathname: "/settings/webview",
      params: { url, title },
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={[
          styles.titleBar,
          { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
        ]}
      >
        <Text variant="h2" weight="bold">
          Settings
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsMenuVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* More Options Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsMenuVisible(false)}
        >
          <View
            style={[
              styles.menuDropdown,
              {
                backgroundColor: colors.card,
                top: insets.top + 50,
                right: spacing.md,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                navigateToWebView(
                  WEBSITE_URL + "/privacy-policy",
                  "Privacy Policy",
                )
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                navigateToWebView(
                  WEBSITE_URL + "/refund-policy",
                  "Refund Policy",
                )
              }
            >
              <Ionicons name="cash-outline" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Refund Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                navigateToWebView(
                  WEBSITE_URL + "/terms-and-conditions",
                  "Terms & Conditions",
                )
              }
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.text}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={[styles.header, { padding: spacing.lg }]}>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text variant="h3" weight="bold">
                {user?.name}
              </Text>
              <Text variant="bodySmall" color="secondaryText">
                {user?.email}
              </Text>
              {user?.role === "premium" && (
                <View style={styles.premiumBadge}>
                  <Badge label="PRO" variant="success" size="sm" />
                </View>
              )}
            </View>
            <Image
              source={user?.picture}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          </View>
        </View>

        {/* Storage Usage Section */}
        <View
          style={[
            styles.card,
            {
              marginHorizontal: spacing.md,
              backgroundColor: colors.secondaryBackground,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.storageLabelRow}>
              <Ionicons
                name="cloud-outline"
                size={18}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text variant="label" weight="semibold">
                Storage
              </Text>
            </View>
            <Button
              title="Upgrade"
              variant="primary"
              size="sm"
              onPress={handleUpgrade}
              style={{
                minHeight: 32,
                height: 32,
                borderRadius: 8,
                paddingVertical: 0,
              }}
              textStyle={{ fontSize: 12 }}
            />
          </View>

          <View
            style={[
              styles.progressBarContainer,
              { backgroundColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: `${storagePercentage}%`,
                  backgroundColor:
                    storagePercentage > 90 ? colors.error : colors.primary,
                },
              ]}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text variant="caption" color="secondaryText">
              {storagePercentage.toFixed(1)}% used
            </Text>
            <Text variant="caption" color="secondaryText">
              {formatFileSize(usedStorage)} / {formatFileSize(maxStorage)}
            </Text>
          </View>
        </View>

        {/* ACCOUNT Section */}
        <View style={[styles.menuWrapper, { marginTop: spacing.xl }]}>
          <Text
            variant="label"
            color="secondaryText"
            style={[styles.menuSectionTitle, { marginLeft: spacing.lg }]}
          >
            ACCOUNT
          </Text>
          <View
            style={[
              styles.card,
              {
                marginHorizontal: spacing.md,
                backgroundColor: colors.secondaryBackground,
              },
            ]}
          >
            <MenuItem
              label="Edit Profile"
              subLabel="Change your name, email, or avatar"
              leftIcon="person-outline"
              onPress={() => router.push("/settings/edit-profile")}
            />
            <Separator />
            <MenuItem
              label="Security Settings"
              subLabel="Two-factor authentication, Passkeys"
              leftIcon="shield-checkmark-outline"
              onPress={() => router.push("/settings/security")}
            />
            <Separator />
            <MenuItem
              label="Link a Device"
              subLabel="Connect your desktop or other devices"
              leftIcon="phone-portrait-outline"
              onPress={() => router.push("/settings/link-device")}
            />
          </View>
        </View>

        {/* PREFERENCES Section */}
        <View style={[styles.menuWrapper, { marginTop: spacing.xl }]}>
          <Text
            variant="label"
            color="secondaryText"
            style={[styles.menuSectionTitle, { marginLeft: spacing.lg }]}
          >
            PREFERENCES
          </Text>
          <View
            style={[
              styles.card,
              {
                marginHorizontal: spacing.md,
                backgroundColor: colors.secondaryBackground,
              },
            ]}
          >
            <MenuItem
              label="Plans & Pricing"
              subLabel="Upgrade or change your plan"
              leftIcon="card-outline"
              onPress={handleUpgrade}
            />
            <Separator />
            <MenuItem
              label="Backup Data"
              subLabel="Export your data"
              leftIcon="cloud-download-outline"
              onPress={() => router.push("/settings/backup")}
            />
            <Separator />
            <MenuItem
              label="Storage Settings"
              subLabel="Manage your storage preference"
              leftIcon="cloud-upload-outline"
              onPress={() => router.push("/settings/storage")}
            />
          </View>
        </View>

        {/* COMMUNITY Section */}
        <View style={[styles.menuWrapper, { marginTop: spacing.xl }]}>
          <Text
            variant="label"
            color="secondaryText"
            style={[styles.menuSectionTitle, { marginLeft: spacing.lg }]}
          >
            COMMUNITY
          </Text>
          <View
            style={[
              styles.card,
              {
                marginHorizontal: spacing.md,
                backgroundColor: colors.secondaryBackground,
              },
            ]}
          >
            <MenuItem
              label="Share App"
              subLabel="Invite your friends to StoreOne"
              leftIcon="share-social-outline"
              onPress={handleShareApp}
            />
            <Separator />
            <MenuItem
              label="Website"
              subLabel="Visit our official website"
              leftIcon="globe-outline"
              onPress={() => openLink(WEBSITE_URL)}
            />
            <Separator />
            <MenuItem
              label="LinkedIn"
              subLabel="Follow us on LinkedIn"
              leftIcon="logo-linkedin"
              onPress={() => openLink(LINKEDIN_URL)}
            />
            <Separator />
            <MenuItem
              label="X (Twitter)"
              subLabel="Get latest updates on X"
              leftIcon="logo-twitter"
              onPress={() => openLink(X_URL)}
            />
          </View>
        </View>

        {/* SYSTEM Section */}
        <View style={[styles.menuWrapper, { marginTop: spacing.xl }]}>
          <Text
            variant="label"
            color="secondaryText"
            style={[styles.menuSectionTitle, { marginLeft: spacing.lg }]}
          >
            SYSTEM
          </Text>
          <View
            style={[
              styles.card,
              {
                marginHorizontal: spacing.md,
                backgroundColor: colors.secondaryBackground,
              },
            ]}
          >
            <MenuItem
              label="Danger Zone"
              subLabel="Delete or deactivate account"
              leftIcon="warning-outline"
              variant="danger"
              onPress={() => router.push("/settings/danger-zone")}
            />
          </View>
        </View>

        <View style={{ marginBottom: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBar: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuDropdown: {
    position: "absolute",
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    alignItems: "center",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginLeft: 16,
  },
  nameContainer: {
    flex: 1,
  },
  premiumBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  storageLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    width: "100%",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  menuWrapper: {
    width: "100%",
  },
  menuSectionTitle: {
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
});
