import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/share";

export const Route = createFileRoute("/share/$shareId")({
  component: function ProductRoute() {
    const { shareId } = Route.useParams();
    return <Index shareId={shareId} />;
  },
});
