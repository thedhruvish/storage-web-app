import { createFileRoute } from "@tanstack/react-router";
import Error500 from "@/components/status-code/500";

export const Route = createFileRoute("/error/500")({
  component: Error500,
});
