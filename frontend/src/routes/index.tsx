import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className='text-center'>
      <p>This is my page</p>
    </div>
  );
}
