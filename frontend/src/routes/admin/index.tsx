import { createFileRoute } from "@tanstack/react-router";
import UserList from "@/pages/admin/users";

export const Route = createFileRoute("/admin/")({
  component: UserList,
});
