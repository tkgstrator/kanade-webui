"use client"

import { Link, useNavigate } from "@tanstack/react-router"
import { Disc3, History, Home, Library, ListMusic, Mic2, Music2, Radio, Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const mainMenuItems = [
  {
    icon: Home,
    title: "今すぐ聴く",
  },
  {
    icon: Search,
    title: "見つける",
  },
  {
    icon: Radio,
    title: "ラジオ",
  },
]

const libraryItems = [
  {
    icon: History,
    title: "最近追加した項目",
  },
  {
    icon: Mic2,
    title: "アーティスト",
  },
  {
    icon: Disc3,
    title: "アルバム",
  },
  {
    icon: Music2,
    title: "曲",
  },
  {
    icon: ListMusic,
    title: "プレイリスト",
  },
]

const playlists = ["お気に入りミックス", "Chill Vibes", "ワークアウト", "ドライブ用", "作業用BGM"]

export function MusicSidebar() {
  const navigate = useNavigate({ from: "/" })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = e.currentTarget.value
      if (value.trim()) {
        navigate({ search: { term: value.trim() }, to: "/search" })
      }
    }
  }

  return (
    <Sidebar className="border-r border-sidebar-border select-none">
      <SidebarHeader className="px-4 py-3">
        <Link to="/">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl">Music</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <div className="px-2 pb-2 min-w-0">
            <InputGroup>
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput onKeyDown={handleKeyDown} placeholder="検索" />
            </InputGroup>
          </div>
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className="hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                  tooltip={item.title}
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Library className="mr-2 size-4" />
            ライブラリ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    tooltip={item.title}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ListMusic className="mr-2 size-4" />
            プレイリスト
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {playlists.map((playlist) => (
                <SidebarMenuItem key={playlist}>
                  <SidebarMenuButton
                    className="hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    tooltip={playlist}
                  >
                    <span className="text-muted-foreground">♪</span>
                    <span>{playlist}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
