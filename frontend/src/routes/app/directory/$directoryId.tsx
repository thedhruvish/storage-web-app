import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/directory";

export const Route = createFileRoute("/app/directory/$directoryId")({
  component: function ProductRoute() {
    const { directoryId } = Route.useParams();
    return <Home directoryId={directoryId} />;
  },
});
