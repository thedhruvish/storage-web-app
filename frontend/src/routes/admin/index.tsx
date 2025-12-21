import { createFileRoute } from "@tanstack/react-router";
import { UsersList } from "@/pages/admin/users";

export const Route = createFileRoute("/admin/")({
  component: UsersList,
});
