import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: function () {
    const navigate = useNavigate();
    navigate({ to: "/directory" });
    return <></>;
  },
});
