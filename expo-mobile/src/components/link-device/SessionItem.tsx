import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/use-theme";
import { Text, Badge } from "@/components/ui";

interface SessionItemProps {
  session: any;
  isCurrent: boolean;
  index: number;
  onRevoke: (sessionId: string) => void;
}

export const SessionItem = ({
  session,
  isCurrent,
  index,
  onRevoke,
}: SessionItemProps) => {
  const { colors } = useTheme();

  const getDeviceIcon = (os: any) => {
    console.log(os);
    const osLower = os?.device?.browser;

    if (osLower === "mobile") return "phone-portrait-outline";
    else if (
      osLower &&
      (osLower.includes("windows") ||
        osLower.includes("mac") ||
        osLower.includes("linux"))
    )
      return "desktop-outline";
    return "globe-outline";
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={styles.container}
    >
      <View style={styles.sessionRow}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Ionicons
            name={getDeviceIcon(session)}
            size={24}
            color={isCurrent ? colors.primary : colors.text}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text weight="semibold" numberOfLines={1}>
              {session.device.type || "Unknown Browser"} on{" "}
              {session.device.os || "Unknown OS"}
            </Text>
            {isCurrent && (
              <Badge
                label="Current"
                variant="success"
                size="sm"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          <Text variant="caption" color="secondaryText">
            {session.ip} •{" "}
            {typeof session.location === "object"
              ? `${session.location.city}, ${session.location.countryCode}`
              : session.location || "Unknown Location"}
          </Text>
          <Text variant="caption" color="secondaryText">
            Last active: {new Date(session.createdAt).toLocaleString()}
          </Text>
        </View>
        {session.isActive && (
          <TouchableOpacity
            onPress={() => onRevoke(session._id)}
            style={styles.revokeButton}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
  revokeButton: {
    padding: 8,
  },
});
