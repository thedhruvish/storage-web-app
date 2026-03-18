import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTheme } from "@/hooks/use-theme";
import { useUserStore } from "@/store/user-store";
import { Text } from "@/components/ui";

export const SearchBarHeader = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useUserStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.searchPill, { backgroundColor: colors.secondaryBackground }]}
        onPress={() => router.push("/search")}
        activeOpacity={0.9}
      >
        <MaterialIcons
          name="search"
          size={22}
          color={colors.secondaryText}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.searchPlaceholder, { color: colors.secondaryText }]}>
          Search in StoreOne
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/settings")}
        style={styles.avatarButton}
      >
        {user?.picture ? (
          <Image
            source={user.picture}
            style={styles.avatarImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  searchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  avatarButton: {
    marginLeft: 0,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
