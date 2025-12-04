"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ArtistSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6 px-6 pt-8 pb-6 md:flex-row md:items-end md:gap-8 md:px-8 md:pt-12">
        <Skeleton className="size-40 rounded-full md:size-52" />
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-9 w-32 rounded-full" />
        </div>
      </div>
      <div className="px-6 md:px-8">
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div className="flex flex-col gap-2" key={i}>
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
