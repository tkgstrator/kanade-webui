'use client'

import { Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import { QueueHistory } from '@/components/queue-status'
import { SearchInput } from '@/components/search-input'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

export function MusicSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border select-none" collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-4 py-3">
        <Link to="/">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl">Kanade</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <div className="px-2 pb-2 min-w-0">
            <SearchInput />
          </div>
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="text-base! hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                tooltip="ホーム"
              >
                <Link to="/">
                  <Home className="size-5" />
                  <span>ホーム</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <QueueHistory />
      </SidebarContent>
    </Sidebar>
  )
}
