import type React from "react";
import Turnstile, { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

interface TurnstileWidgetProps {
  setTurnstileLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTurnstileToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export function TurnstileWidget({
  setTurnstileLoading,
  setTurnstileToken,
}: TurnstileWidgetProps) {
  const { theme } = useTheme();
  const turnstile = useTurnstile();
  return (
    <Turnstile
      sitekey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
      fixedSize={true}
      retry={"auto"}
      theme={theme == "dark" ? "dark" : "light"}
      onUnsupported={() => {
        toast.error(
          "This website Does not Supported this Browser. Use Chrome or any other"
        );
      }}
      onLoad={() => setTurnstileLoading(true)}
      onExpire={() => {
        turnstile.reset();
      }}
      onVerify={(token) => {
        setTurnstileToken(token);
      }}
    />
  );
}
