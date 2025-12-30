import { createFileRoute } from "@tanstack/react-router";
import AccountDeletionWarning from "@/pages/other/account-delete-contact";

export const Route = createFileRoute("/_web/account-deleted")({
  component: AccountDeletionWarning,
});
