import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTheme } from "@/hooks/use-theme";
import { Text, TextInput, Button } from "@/components/ui";
import { useUserStore } from "@/store/user-store";
import { useUserInfoUpdate } from "@/api/user-api";
import { showGlobalDialog } from "@/components/dialog";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const updateMutation = useUserInfoUpdate();

  const [name, setName] = useState(user?.name || "");

  const handleUpdate = () => {
    if (!name.trim()) {
      showGlobalDialog({ title: "Error", message: "Name cannot be empty", type: "error" });
      return;
    }

    updateMutation.mutate(
      { name },
      {
        onSuccess: (response) => {
          if (user) {
            setUser({ ...user, name });
          }
          showGlobalDialog({ title: "Success", message: "Profile updated successfully", type: "success" });
          router.back();
        },
        onError: (error: any) => {
          showGlobalDialog({
            title: "Update Failed",
            message: error.response?.data?.message || "Something went wrong",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Edit Profile", headerTransparent: false }} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.avatarSection}>
          <Image
            source={user?.profile}
            style={styles.avatar}
            contentFit="cover"
          />
          <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <TextInput
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.secondaryText} />}
          />

          <TextInput
            label="Email Address"
            value={user?.email || ""}
            editable={false}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.secondaryText} />}
            containerStyle={{ opacity: 0.7 }}
          />

          <Button
            title="Save Changes"
            onPress={handleUpdate}
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
});
