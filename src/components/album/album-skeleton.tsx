"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function AlbumSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <Skeleton className="aspect-square w-full max-w-[270px] rounded-lg" />
        <div className="flex flex-col items-center justify-end gap-2 md:items-start">
          <Skeleton className="hidden md:block h-4 w-16" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton className="h-14 w-full rounded-md" key={i} />
        ))}
      </div>
    </div>
  )
}
