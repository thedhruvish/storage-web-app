import { createFileRoute } from "@tanstack/react-router";
import NotFound from "@/pages/other/not-found";

export const Route = createFileRoute("/share/")({
  component: NotFound,
});
