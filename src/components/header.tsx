'use client'

import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function Header() {
  const { toggleSidebar } = useSidebar()

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-12 px-4',
        'flex items-center gap-3',
        'bg-background/80',
        'backdrop-blur-xl',
        'border-b border-border/50',
        'md:hidden',
      )}
    >
      {/* ハンバーガーメニュー */}
      <Button
        aria-controls="navigation"
        aria-expanded="false"
        aria-label="ナビゲーションを開く"
        className="size-10 text-foreground hover:bg-accent"
        onClick={toggleSidebar}
        size="icon"
        variant="ghost"
      >
        <Menu className="size-6" />
      </Button>

      {/* ロゴ */}
      <Link className="flex items-center" to="/">
        <span className="text-[21px] font-semibold tracking-tight text-foreground">Kanade</span>
      </Link>
    </header>
  )
}
