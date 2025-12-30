import { createFileRoute } from "@tanstack/react-router";
import { TwoFactorSelection } from "@/pages/auth/2fa-selection";

export const Route = createFileRoute("/auth/2fa/")({
  component: TwoFaSelectionPage,
});

function TwoFaSelectionPage() {
  return <TwoFactorSelection />;
}
