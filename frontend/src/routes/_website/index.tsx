import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_website/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_others/"!</div>
}
