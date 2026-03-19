import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/use-theme";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FileSkeletonProps {
  viewMode: "grid" | "list";
}

const SkeletonItem = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (viewMode === "grid") {
    return (
      <View
        style={[
          styles.gridContainer,
          {
            borderColor: colors.separator,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.gridIconWrapper,
            { backgroundColor: colors.secondaryBackground },
            animatedStyle,
          ]}
        />
        <View style={styles.gridTextWrapper}>
          <Animated.View
            style={[
              styles.gridNameSkeleton,
              { backgroundColor: colors.secondaryBackground },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.listContainer, { borderBottomColor: colors.separator }]}
    >
      <Animated.View
        style={[
          styles.listIconWrapper,
          { backgroundColor: colors.secondaryBackground },
          animatedStyle,
        ]}
      />
      <View style={styles.listMainContent}>
        <Animated.View
          style={[
            styles.listNameSkeleton,
            { backgroundColor: colors.secondaryBackground },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.listSubTextSkeleton,
            { backgroundColor: colors.secondaryBackground },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

export const FileSkeleton = ({ viewMode }: FileSkeletonProps) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const numColumns =
    viewMode === "list" ? 1 : Math.max(2, Math.floor(width / 150));
  const data = Array.from({ length: 12 });

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={() => <SkeletonItem viewMode={viewMode} />}
        numColumns={numColumns}
        contentContainerStyle={[
          viewMode === "grid" ? styles.gridContent : styles.listContent,
          {
            paddingBottom: insets.bottom + 24,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  gridContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  gridIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  gridTextWrapper: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  gridNameSkeleton: {
    height: 14,
    width: "80%",
    borderRadius: 4,
  },
  listContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  listMainContent: {
    flex: 1,
  },
  listNameSkeleton: {
    height: 16,
    width: "60%",
    borderRadius: 4,
    marginBottom: 8,
  },
  listSubTextSkeleton: {
    height: 12,
    width: "40%",
    borderRadius: 4,
  },
});
