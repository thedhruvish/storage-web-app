import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useLogin, useGoogleLogin } from "@/api/authService";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleGoogleSuccess = (userInfo: any) => {
    if (userInfo.idToken) {
      googleLoginMutation.mutate(userInfo.idToken);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error("Google Error:", error);
  };

  const isLoading = loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
      >
        <View style={[styles.header, { marginBottom: spacing.xxl }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome Back
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.secondaryText, marginTop: spacing.xs },
            ]}
          >
            Sign in to your account
          </Text>
        </View>

        <View style={[styles.form, { gap: spacing.md }]}>
          <View style={[styles.inputGroup, { gap: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.separator,
                  backgroundColor: colors.secondaryBackground,
                  paddingHorizontal: spacing.md,
                  borderRadius: spacing.borderRadius,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.secondaryText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputGroup, { gap: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: colors.separator,
                  backgroundColor: colors.secondaryBackground,
                  borderRadius: spacing.borderRadius,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    paddingHorizontal: spacing.md,
                    flex: 1,
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ paddingHorizontal: spacing.sm }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: colors.tint,
                height: 50,
                borderRadius: spacing.borderRadius,
                marginTop: spacing.sm,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View
            style={[styles.dividerContainer, { marginVertical: spacing.md }]}
          >
            <View
              style={[styles.divider, { backgroundColor: colors.separator }]}
            />
            <Text
              style={[
                styles.dividerText,
                {
                  color: colors.secondaryText,
                  backgroundColor: colors.background,
                  paddingHorizontal: spacing.sm,
                },
              ]}
            >
              OR
            </Text>
          </View>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          <View style={[styles.footer, { marginTop: spacing.lg }]}>
            <Text style={{ color: colors.secondaryText }}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/register")}
              disabled={isLoading}
            >
              <Text style={{ color: colors.link, fontWeight: "bold" }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
  },
  form: {},
  inputGroup: {},
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputWrapper: {
    height: 50,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 16,
  },

  loginButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: "100%",
    height: 1,
  },
  dividerText: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
