import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Link href={"/(auth)/otp"}>
        <Text>Setting Screen</Text>
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
