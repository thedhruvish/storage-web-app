import { createFileRoute } from "@tanstack/react-router";
import InputOTPPage from "@/pages/auth/otp-verify";

export const Route = createFileRoute("/auth/otp-verify")({
  component: InputOTPPage,
});
