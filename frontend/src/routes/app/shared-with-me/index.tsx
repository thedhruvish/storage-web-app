import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/shared-with-me/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/shared-with-me/"!</div>
}
