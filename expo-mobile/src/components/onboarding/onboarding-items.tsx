import React from "react";
import { View, Platform, StyleSheet, Dimensions } from "react-native";
import { SymbolView } from "expo-symbols";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Text } from "@/components/ui";
import { OnboardingData } from "./onboarding-data";
import { useTheme } from "@/hooks/use-theme";

const { width } = Dimensions.get("window");

export const OnboardingItem = ({ item }: { item: OnboardingData }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        entering={FadeInUp.delay(200).duration(800)}
        style={styles.iconContainer}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary + "10" },
          ]}
        >
          {Platform.OS === "ios" ? (
            <SymbolView
              name={item.icon}
              size={80}
              tintColor={colors.primary}
              fallback={
                <MaterialIcons
                  name={item.materialIcon}
                  size={80}
                  color={colors.primary}
                />
              }
            />
          ) : (
            <MaterialIcons
              name={item.materialIcon}
              size={80}
              color={colors.primary}
            />
          )}
        </View>
      </Animated.View>

      <View style={styles.textContainer}>
        <Animated.View entering={FadeInDown.delay(400).duration(800)}>
          <Text
            variant="h1"
            align="center"
            style={[styles.title, { color: colors.text }]}
          >
            {item.title}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(800)}>
          <Text
            variant="body"
            align="center"
            style={[styles.description, { color: colors.secondaryText }]}
          >
            {item.description}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    marginBottom: 16,
  },
  description: {
    lineHeight: 24,
  },
});
