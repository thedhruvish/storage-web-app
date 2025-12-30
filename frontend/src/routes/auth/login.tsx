import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/pages/auth/login-form";

export const Route = createFileRoute("/auth/login")({
  component: LoginForm,
});
