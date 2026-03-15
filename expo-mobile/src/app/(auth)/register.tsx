import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useRegister, useGoogleLogin } from "@/api/authService";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLogin();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    registerMutation.mutate({ name, email, password });
  };

  const handleGoogleSuccess = (userInfo: any) => {
    if (userInfo.idToken) {
      googleLoginMutation.mutate(userInfo.idToken);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error("Google Error:", error);
  };

  const isLoading = registerMutation.isPending || googleLoginMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}>
        <View style={[styles.header, { marginBottom: spacing.xl }]}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText, marginTop: spacing.xs }]}>
            Start your journey with us
          </Text>
        </View>

        <View style={[styles.form, { gap: spacing.md }]}>
          <View style={[styles.inputGroup, { gap: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                borderColor: colors.separator, 
                backgroundColor: colors.secondaryBackground,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.borderRadius,
              }]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.secondaryText}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputGroup, { gap: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                borderColor: colors.separator, 
                backgroundColor: colors.secondaryBackground,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.borderRadius,
              }]}
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
                placeholder="Create a password"
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

          <View style={[styles.inputGroup, { gap: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.text }]}>
              Confirm Password
            </Text>
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
                placeholder="Confirm your password"
                placeholderTextColor={colors.secondaryText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ paddingHorizontal: spacing.sm }}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { 
              backgroundColor: colors.tint,
              height: 50,
              borderRadius: spacing.borderRadius,
              marginTop: spacing.sm,
              opacity: isLoading ? 0.7 : 1,
            }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={[styles.dividerContainer, { marginVertical: spacing.md }]}>
            <View style={[styles.divider, { backgroundColor: colors.separator }]} />
            <Text style={[styles.dividerText, { 
              color: colors.secondaryText, 
              backgroundColor: colors.background,
              paddingHorizontal: spacing.sm,
            }]}>
              OR
            </Text>
          </View>

          <GoogleSignInButton 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          <View style={[styles.footer, { marginTop: spacing.lg }]}>
            <Text style={{ color: colors.secondaryText }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")} disabled={isLoading}>
              <Text style={{ color: colors.link, fontWeight: "bold" }}>Login</Text>
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
  form: {
  },
  inputGroup: {
  },
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
  registerButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
  },
  dividerText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
