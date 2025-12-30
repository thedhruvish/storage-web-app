import { createFileRoute } from "@tanstack/react-router";
import { OtpVerfiyForm } from "@/pages/auth/otp-form";

export const Route = createFileRoute("/auth/otp-verify")({
  component: OtpVerfiyForm,
});
