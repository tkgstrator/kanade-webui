import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/artists/')({
  component: () => <Navigate to="/" />,
})
