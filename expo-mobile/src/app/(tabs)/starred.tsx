import { Text, View, StyleSheet } from "react-native";

export default function StarredScreen() {
  return (
    <View style={styles.container}>
      <Text>Starred Screen</Text>
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
