import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/recent/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/recent/"!</div>
}
