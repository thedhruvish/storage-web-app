import { z } from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";

const githubSearchSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
  showSetUp2Fa: z.boolean().optional(),
  isEnabled2Fa: z.boolean().optional(),
  isTotp: z.boolean().optional(),
  isPasskey: z.boolean().optional(),
  userId: z.string().optional(),
});

export const Route = createFileRoute("/auth/github")({
  validateSearch: (search) => githubSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (search.error) {
      throw redirect({
        to: "/auth/login",
        search: {
          error: search.error,
          error_description: search.error_description,
        },
      });
    }

    // Handle 2FA Setup
    if (search.showSetUp2Fa) {
      throw redirect({
        to: "/auth/2fa/setup",
      });
    }

    // Handle 2FA Verification
    if (search.isEnabled2Fa && search.userId) {
      localStorage.setItem("userId", search.userId);
      localStorage.setItem("isTotp", String(!!search.isTotp));
      localStorage.setItem("isPasskey", String(!!search.isPasskey));
      throw redirect({
        to: "/auth/2fa",
      });
    }

    // Default redirect to app if logged in but no specific 2FA action
    if (search.userId) {
      throw redirect({ to: "/app" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/auth/github"!</div>;
}
