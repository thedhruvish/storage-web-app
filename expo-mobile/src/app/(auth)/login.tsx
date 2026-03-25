import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { GoogleSignInButton } from "@/components/google-signIn-button";
import { useLogin } from "@/api/auth-api";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { showGlobalDialog } from "@/components/dialog";
import { Text, TextInput, Button } from "@/components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDeviceInfo } from "@/utils/device-info";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<RNTextInput>(null);

  const handleLogin = async () => {
    const { success, error } = loginSchema.safeParse({ email, password });
    if (success) {
      const deviceInfo = await getDeviceInfo();
      loginMutation.mutate({
        email,
        password,
        deviceName: deviceInfo.deviceName,
        ip: deviceInfo.ip,
      });
    } else {
      showGlobalDialog({
        title: "Input Validation Failed",
        type: "error",
        message: error.issues[0].message,
      });
    }
  };

  const isLoading = loginMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { marginBottom: spacing.xxl }]}>
          <Text variant="h1" align="center">
            Welcome Back
          </Text>
          <Text
            variant="body"
            color="secondaryText"
            align="center"
            style={{ marginTop: spacing.xs }}
          >
            Sign in to your account
          </Text>
        </View>

        <View style={[styles.form, { gap: spacing.md }]}>
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
            leftIcon={
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.secondaryText}
              />
            }
          />

          <TextInput
            ref={passwordRef}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.secondaryText}
              />
            }
            rightIcon={
              <Button
                variant="ghost"
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  minHeight: 0,
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={colors.secondaryText}
                />
              </Button>
            }
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            style={{ marginTop: spacing.sm }}
          />

          <View
            style={[styles.dividerContainer, { marginVertical: spacing.md }]}
          >
            <View
              style={[styles.divider, { backgroundColor: colors.separator }]}
            />
            <Text
              variant="caption"
              color="secondaryText"
              style={{
                backgroundColor: colors.background,
                paddingHorizontal: spacing.sm,
              }}
            >
              OR
            </Text>
          </View>

          <GoogleSignInButton disabled={isLoading} />

          <View style={[styles.footer, { marginTop: spacing.lg }]}>
            <Text color="secondaryText">Don&apos;t have an account? </Text>
            <Button
              variant="ghost"
              onPress={() => router.push("/register")}
              disabled={isLoading}
              style={{ minHeight: 0, paddingHorizontal: 0, paddingVertical: 0 }}
            >
              <Text color="link" weight="bold">
                Register
              </Text>
            </Button>
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
  form: {},
  dividerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: "100%",
    height: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
