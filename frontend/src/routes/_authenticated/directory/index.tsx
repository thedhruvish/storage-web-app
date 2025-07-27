import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/directory";

export const Route = createFileRoute("/_authenticated/directory/")({
  component: Home,
});
