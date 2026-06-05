import { useMutationState } from '@tanstack/react-query'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

dayjs.extend(relativeTime)
dayjs.locale('ja')

function extractAlbumId(variables: unknown): number | undefined {
  if (variables == null || typeof variables !== 'object') return undefined
  if (!('album_id' in variables)) return undefined
  const id = variables.album_id
  return typeof id === 'number' ? id : undefined
}

export function QueueHistory() {
  const mutations = useMutationState({
    filters: {
      mutationKey: ['queues'],
    },
    select: (mutation) => ({
      albumId: extractAlbumId(mutation.state.variables),
      status: mutation.state.status,
      submittedAt: mutation.state.submittedAt,
    }),
  })

  const recentMutations = mutations
    .filter((m) => m.albumId != null)
    .slice(-10)
    .reverse()

  if (recentMutations.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Clock className="mr-2 size-4" />
        キュー履歴
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {recentMutations.map((mutation) => (
            <SidebarMenuItem key={`${mutation.albumId}-${mutation.submittedAt}`}>
              <div className="flex w-full items-center gap-2 px-2 py-1.5 text-sm">
                {mutation.status === 'success' ? (
                  <CheckCircle className="size-4 shrink-0 text-green-500" />
                ) : mutation.status === 'error' ? (
                  <XCircle className="size-4 shrink-0 text-red-500" />
                ) : (
                  <Clock className="size-4 shrink-0 animate-spin text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate text-foreground">ID: {mutation.albumId}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{dayjs(mutation.submittedAt).fromNow()}</span>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
