import { createFileRoute } from "@tanstack/react-router";
import Error404 from "@/components/status-code/404";

export const Route = createFileRoute("/error/404")({
  component: Error404,
});
