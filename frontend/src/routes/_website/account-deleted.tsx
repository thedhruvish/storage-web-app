import { createFileRoute } from "@tanstack/react-router";
import AccountDeletionWarning from "@/pages/other/account-delete-contact";

export const Route = createFileRoute("/_website/account-deleted")({
  component: AccountDeletionWarning,
});
