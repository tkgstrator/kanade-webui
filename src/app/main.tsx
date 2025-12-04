"use client"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Tokyo")

import { routeTree } from "./routeTree.gen"

import "./styles.css"
import { QueryClient } from "@tanstack/react-query"
import { MusicSidebar } from "@/components/music-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      networkMode: "offlineFirst",
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 10,
    },
  },
})

const persister = createAsyncStoragePersister({
  deserialize: JSON.parse,
  key: "REACT_QUERY_OFFLINE_CACHE",
  serialize: JSON.stringify,
  storage: window.localStorage,
  throttleTime: 1000,
})

// biome-ignore lint/style/noNonNullAssertion: reason
const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <PersistQueryClientProvider
        client={client}
        persistOptions={{
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              return query.state.status === "success"
            },
          },
          maxAge: 1000 * 60 * 60 * 24,
          persister: persister,
        }}
      >
        <ThemeProvider>
          <main className="flex-1 min-w-0 overflow-auto">
            <RouterProvider router={router} />
          </main>
          <Toaster />
        </ThemeProvider>
      </PersistQueryClientProvider>
    </StrictMode>,
  )
}
