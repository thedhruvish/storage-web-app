import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/dashboard";

export const Route = createFileRoute("/_authenticated/directory/")({
  component: Home,
});
