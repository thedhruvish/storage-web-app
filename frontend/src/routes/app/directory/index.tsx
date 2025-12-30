import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/directory";

export const Route = createFileRoute("/app/directory/")({
  component: Home,
});
