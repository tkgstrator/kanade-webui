import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Page,
})

function Page() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8">
    </div>
  )
}
