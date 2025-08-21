import { createFileRoute } from "@tanstack/react-router";
import Error503 from "@/components/status-code/503";

export const Route = createFileRoute("/error/503")({
  component: Error503,
});
