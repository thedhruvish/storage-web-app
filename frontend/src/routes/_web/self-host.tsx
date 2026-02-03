import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_web/self-host')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_web/seft-host"!</div>
}
