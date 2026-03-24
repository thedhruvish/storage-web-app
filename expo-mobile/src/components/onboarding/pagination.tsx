import React from "react";
import { View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { OnboardingData } from "./onboarding-data";
import { PaginationDot } from "./pagination-dot";

export const Pagination = ({
  scrollX,
  data,
}: {
  scrollX: SharedValue<number>;
  data: OnboardingData[];
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      {data.map((_, index) => (
        <PaginationDot key={index} index={index} scrollX={scrollX} />
      ))}
    </View>
  );
};
