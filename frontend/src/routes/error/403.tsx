import { createFileRoute } from "@tanstack/react-router";
import Error403 from "@/components/status-code/403";

export const Route = createFileRoute("/error/403")({
  component: Error403,
});
