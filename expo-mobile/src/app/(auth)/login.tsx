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
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    console.log("Login:", { email, password, rememberMe });
    router.replace("/(tabs)");
  };

  const handleGoogleSuccess = (userInfo: any) => {
    console.log("Google Success:", userInfo);
    router.replace("/(tabs)");
  };

  const handleGoogleError = (error: any) => {
    console.error("Google Error:", error);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}>
        <View style={[styles.header, { marginBottom: spacing.xxl }]}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText, marginTop: spacing.xs }]}>
            Sign in to your account
          </Text>
        </View>

        <View style={[styles.form, { gap: spacing.md }]}>
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
            />
          </View>

          <View style={[styles.inputGroup, { gap: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                borderColor: colors.separator, 
                backgroundColor: colors.secondaryBackground,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.borderRadius,
              }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.secondaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.rememberRow}>
            <View style={[styles.rememberMe, { gap: spacing.sm }]}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: colors.separator, true: colors.tint }}
                thumbColor={Platform.OS === 'ios' ? undefined : (rememberMe ? colors.background : '#f4f3f4')}
              />
              <Text style={[styles.rememberMeText, { color: colors.text }]}>
                Remember me
              </Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={{ color: colors.link }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { 
              backgroundColor: colors.tint,
              height: 50,
              borderRadius: spacing.borderRadius,
              marginTop: spacing.sm,
            }]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
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
            <Text style={{ color: colors.secondaryText }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={{ color: colors.link, fontWeight: "bold" }}>Register</Text>
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
  input: {
    height: 50,
    borderWidth: 1,
    fontSize: 16,
  },
  rememberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberMeText: {
    fontSize: 14,
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
