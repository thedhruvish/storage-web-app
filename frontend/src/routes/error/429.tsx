import { createFileRoute } from "@tanstack/react-router";
import Error429 from "@/components/status-code/429";

export const Route = createFileRoute("/error/429")({
  component: Error429,
});
