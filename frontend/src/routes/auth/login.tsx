import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/pages/auth/login-form";

const loginSearchSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
  tab: z.enum(["password", "qr"]).optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginForm,
});
