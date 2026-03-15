import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { useResendOtp, useVerifyOtp } from "@/api/auth-api";
import { Text, Button } from "@/components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OTPScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<RNTextInput | null>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
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
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length === 6 && userId) {
      verifyOtpMutation.mutate({ userId, otp: otpString });
    }
  };

  const handleResendOtp = () => {
    if (userId && canResend && !resendOtpMutation.isPending) {
      setCanResend(false);
      setTimer(120); // Reset timer immediately to prevent multiple clicks
      resendOtpMutation.mutate(userId, {
        onError: () => {
        },
      });
    }
  };

  const isLoading = verifyOtpMutation.isPending;
  const isResending = resendOtpMutation.isPending;

  if (!userId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text variant="body" color="text">User was not Found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingHorizontal: spacing.lg,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg
          }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { marginBottom: spacing.xxl }]}>
          <Text variant="h2" align="center">
            Verification
          </Text>
          <Text
            variant="body"
            color="secondaryText"
            align="center"
            style={{ marginTop: spacing.xs }}
          >
            Enter the 6-digit code sent to your email
          </Text>
        </View>

        <View style={[styles.otpContainer, { gap: spacing.sm }]}>
          {otp.map((digit, index) => (
            <RNTextInput
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
          <Button
            title="Verify"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.join("").length !== 6 || isLoading}
            size="lg"
            style={{ marginTop: spacing.xl, width: '100%' }}
          />

          <View style={[styles.resendContainer, { marginTop: spacing.lg }]}>
            <Text color="secondaryText">
              Didn't receive the code?{" "}
            </Text>
            <Button
              variant="ghost"
              onPress={handleResendOtp}
              disabled={!canResend || resendOtpMutation.isPending}
              style={{ minHeight: 0, paddingHorizontal: 0, paddingVertical: 0 }}
            >
              <Text
                color={canResend ? "link" : "secondaryText"}
                weight="bold"
              >
                {canResend ? "Resend" : `Resend in ${formatTime(timer)}`}
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
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
