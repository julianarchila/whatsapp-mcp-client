"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { IntegrationsSection } from "@/components/IntegrationsSection"
import { mockIntegrations } from "./integrations.data"
import type { Integration } from "@/components/IntegrationCard"

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
      <IntegrationsSection
        integrations={integrations}
        onToggleIntegration={handleToggleIntegration}
        onConfigureIntegration={handleConfigureIntegration}
      />
    </div>
  )
}
