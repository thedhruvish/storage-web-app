import { createFileRoute } from "@tanstack/react-router";
import UserList from "@/pages/admin/Users";

export const Route = createFileRoute("/admin/")({
  component: UserList,
});
