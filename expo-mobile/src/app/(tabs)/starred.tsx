import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";

export default function StarredScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h2">Starred Screen</Text>
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
