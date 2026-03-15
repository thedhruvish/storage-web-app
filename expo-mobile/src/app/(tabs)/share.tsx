import { Text, View, StyleSheet } from "react-native";

export default function ShareScreen() {
  return (
    <View style={styles.container}>
      <Text>Share Screen</Text>
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
