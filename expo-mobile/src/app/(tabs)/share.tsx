import { View, StyleSheet } from "react-native";
import { Button, Text } from "@/components/ui";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";

export default function ShareScreen() {
  return (
    <View style={styles.container}>
      <Button
        onPress={() => handleToken.deleteToken(AUTH_TOKEN_NAME)}
        title="THis is Buttion"
      />
      <Text>{handleToken.getToken(AUTH_TOKEN_NAME)}</Text>
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
