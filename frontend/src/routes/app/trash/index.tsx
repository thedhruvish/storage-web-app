import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/trash/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/trash/"!</div>
}
