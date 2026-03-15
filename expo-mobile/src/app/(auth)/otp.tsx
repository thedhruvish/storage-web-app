import React, { useState, useRef } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useVerifyOtp } from "@/api/authService";

export default function OTPScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const verifyOtpMutation = useVerifyOtp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      // Focus last filled or next empty
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      // Note: You might need to pass the email here as well depending on your API
      // For this example, I'm assuming the email is stored or available
      verifyOtpMutation.mutate({ email: 'user@example.com', code: otpString });
    }
  };

  const isLoading = verifyOtpMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}>
        <View style={[styles.header, { marginBottom: spacing.xxl }]}>
          <Text style={[styles.title, { color: colors.text }]}>Verification</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText, marginTop: spacing.xs }]}>
            Enter the 6-digit code sent to your email
          </Text>
        </View>

        <View style={[styles.otpContainer, { gap: spacing.sm }]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  color: colors.text,
                  borderColor: digit ? colors.tint : colors.separator,
                  backgroundColor: colors.secondaryBackground,
                  borderRadius: spacing.borderRadius,
                  fontSize: 20,
                },
              ]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1} // Index 0 handles potential paste
              textAlign="center"
              selectionColor={colors.tint}
              editable={!isLoading}
            />
          ))}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              {
                backgroundColor: colors.tint,
                borderRadius: spacing.borderRadius,
                marginTop: spacing.xl,
                opacity: (otp.join('').length === 6 && !isLoading) ? 1 : 0.6,
              },
            ]}
            onPress={handleVerify}
            disabled={otp.join('').length !== 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={[styles.resendContainer, { marginTop: spacing.lg }]}>
            <Text style={{ color: colors.secondaryText }}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={() => console.log("Resending OTP...")} disabled={isLoading}>
              <Text style={{ color: colors.link, fontWeight: "bold" }}>Resend</Text>
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
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    textAlign: "center",
    fontWeight: "bold",
  },
  actionContainer: {
    width: "100%",
    alignItems: "center",
  },
  verifyButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
