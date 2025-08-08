"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { IntegrationsSection } from "@/components/integrations-section"
import { mockIntegrations } from "./integrations.data"
import type { Integration } from "@/components/integration-card"
import { ModeToggle } from "@/components/mode-toggle"

export default function Dashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)

  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (isPending) {
    return <div>Loading...</div>
  }

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, isActive: !integration.isActive }
          : integration
      )
    )
  }

  const handleConfigureIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, isConfigured: true } : integration
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <IntegrationsSection
        integrations={integrations}
        setIntegrations={setIntegrations}
        onToggleIntegration={handleToggleIntegration}
        onConfigureIntegration={handleConfigureIntegration}
      />
    </div>
  )
}

function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-brand-gradient text-white shadow-sm">
              <span className="text-sm font-bold">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight">Threadway</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <ModeToggle />
            <span className="text-xs text-muted-foreground">Manage your MCP connectors</span>
          </div>
        </div>
      </div>
    </header>
  )
}
