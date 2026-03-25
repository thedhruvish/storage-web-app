import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/use-theme";
import { TextInput, Button } from "@/components/ui";
import { useUserStore } from "@/store/user-store";
import {
  useUserInfoUpdate,
  useGenetorAvatarUploadUrl,
  useGetCurrentUser,
} from "@/api/user-api";
import { showGlobalDialog } from "@/components/dialog";

export default function EditProfileScreen() {
  const { colors, spacing } = useTheme();
  const { user, setUser } = useUserStore();
  const { refetch: userRefetch } = useGetCurrentUser();
  const router = useRouter();
  const updateMutation = useUserInfoUpdate();
  const avatarUploadUrlMutation = useGenetorAvatarUploadUrl();

  const [name, setName] = useState(user?.name || "");
  const [isUploading, setIsUploading] = useState(false);
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleAvatarUpload(result.assets[0]);
      }
      await userRefetch();
    } catch (error) {
      console.error("Error picking image:", error);
      showGlobalDialog({
        title: "Error",
        message: "Failed to pick image",
        type: "error",
      });
    }
  };

  const handleAvatarUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);

      const uri = asset.uri;
      const fileName = asset.fileName || uri.split("/").pop() || "avatar.jpg";
      const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
      const contentType = asset.mimeType || `image/${extension}`;

      // 1. Get pre-signed URL
      const { data } = await avatarUploadUrlMutation.mutateAsync({
        contentType,
        extension,
      });

      const uploadUrl = data.data;
      if (!uploadUrl) {
        throw new Error("Failed to get upload URL");
      }

      // 2. Upload to S3 using PUT
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: { uri } as any,
        headers: {
          "Content-Type": contentType,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to upload image to storage");
      }

      showGlobalDialog({
        title: "Success",
        message: "Avatar updated successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      showGlobalDialog({
        title: "Upload Failed",
        message: err.message || "Failed to update avatar",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = () => {
    if (!name.trim()) {
      showGlobalDialog({
        title: "Error",
        message: "Name cannot be empty",
        type: "error",
      });
      return;
    }

    updateMutation.mutate(
      { name },
      {
        onSuccess: () => {
          if (user) {
            setUser({ ...user, name });
          }
          showGlobalDialog({
            title: "Success",
            message: "Profile updated successfully",
            type: "success",
          });
          router.back();
        },
        onError: (error: any) => {
          showGlobalDialog({
            title: "Update Failed",
            message: error.response?.data?.message || "Something went wrong",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{ title: "Edit Profile", headerTransparent: false }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={user?.picture}
              style={styles.avatar}
              contentFit="cover"
            />
            {isUploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="white" size="large" />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.editBadge, { backgroundColor: colors.primary }]}
            onPress={handlePickImage}
            disabled={isUploading}
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <TextInput
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            leftIcon={
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.secondaryText}
              />
            }
          />

          <TextInput
            label="Email Address"
            value={user?.email || ""}
            editable={false}
            leftIcon={
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.secondaryText}
              />
            }
            containerStyle={{ opacity: 0.7 }}
          />

          <Button
            title="Save Changes"
            onPress={handleUpdate}
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending || isUploading}
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
  avatarContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
  },
  avatar: {
    width: 120,
    height: 120,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
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
