import { Link } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Link href={"/(auth)/login"}>
        <Text variant="h2">Setting Screen</Text>
      </Link>
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
