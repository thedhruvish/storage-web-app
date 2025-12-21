import { UsersList } from "@/pages/admin/users";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: UsersList,
});
