import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/2fa/passkey")({
  component: PasskeyPage,
});

function PasskeyPage() {
  return (
    <div className='container flex items-center justify-center min-h-[80vh] py-10'>
      <div>Passkey verification flow coming soon...</div>
    </div>
  );
}
