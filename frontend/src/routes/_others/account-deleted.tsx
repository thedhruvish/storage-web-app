import { createFileRoute } from "@tanstack/react-router";
import AccountDeletionWarning from "@/pages/other/account-delete-contact";

export const Route = createFileRoute("/_others/account-deleted")({
  component: AccountDeletionWarning,
});
