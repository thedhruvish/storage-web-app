import { createFileRoute } from "@tanstack/react-router";
import { SigupForm } from "@/pages/auth/signup-form";

export const Route = createFileRoute("/auth/signup")({
  component: SigupForm,
});
