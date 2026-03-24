import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/use-theme";
import { Text, Button } from "@/components/ui";
import { handleToken, ONBOARD_STATUS } from "@/utils/handle-token";
import {
  ONBOARDING_DATA,
  OnboardingData,
} from "@/components/onboarding/onboarding-data";
import { OnboardingItem } from "@/components/onboarding/onboarding-items";
import { Pagination } from "@/components/onboarding/pagination";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<OnboardingData>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const requestPermission = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        // console.log("Failed to get push token for push notification!");
      }
    } else {
      // console.log("Must use physical device for Push Notifications");
    }
    handleComplete();
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    handleToken.setToken(ONBOARD_STATUS, "true");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text variant="label" style={{ color: colors.secondaryText }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <Pagination scrollX={scrollX} data={ONBOARDING_DATA} />

        {ONBOARDING_DATA[currentIndex].isPermission ? (
          <View style={styles.buttonContainer}>
            <Button
              title="Allow Notifications"
              onPress={requestPermission}
              size="lg"
              style={styles.nextButton}
            />
            <Button
              title="Maybe Later"
              onPress={handleComplete}
              variant="ghost"
              size="md"
              style={styles.maybeLaterButton}
            />
          </View>
        ) : (
          <Button
            title="Next"
            onPress={handleNext}
            size="lg"
            style={styles.nextButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    height: 50,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  skipButton: {
    padding: 8,
  },

  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: "center",
  },

  nextButton: {
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  maybeLaterButton: {
    marginTop: 8,
  },
});
