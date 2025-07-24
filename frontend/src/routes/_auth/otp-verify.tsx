import { createFileRoute } from "@tanstack/react-router";
import InputOTPPage from "@/pages/auth/otp-verify";

export const Route = createFileRoute("/_auth/otp-verify")({
  component: InputOTPPage,
});
