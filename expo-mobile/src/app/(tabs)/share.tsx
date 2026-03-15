import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";

export default function ShareScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h2">Share Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
