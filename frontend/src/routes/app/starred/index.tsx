import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/starred/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/starred/"!</div>
}
