import { createFileRoute } from "@tanstack/react-router";
import { TotpVerify } from "@/pages/auth/totp-verify";

export const Route = createFileRoute("/auth/2fa/totp")({
  component: TotpVerifyPage,
});

function TotpVerifyPage() {
  return <TotpVerify />;
}
