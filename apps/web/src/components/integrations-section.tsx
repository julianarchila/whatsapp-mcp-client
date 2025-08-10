"use client"

import { useState } from "react"
import { Search, Filter, Loader2Icon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IntegrationCard } from "./integration-card"
import { DiscoverToolsModal } from "./discover-tools-modal"
import { CustomIntegrationPopover } from "./custom-integration-popover"
import { useIntegratedTools, useIntegrations } from "@/hooks/use-tools"
import { AlertCircle } from "lucide-react"

export function IntegrationsSection() {
  const { integratedTools, isLoading, error } = useIntegratedTools()
  const { toggleIntegration } = useIntegrations()

  const [searchTerm, setSearchTerm] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showDiscoverModal, setShowDiscoverModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2Icon className="w-10 h-10 text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Loading integrations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Integrations</h3>
        <p className="text-muted-foreground">Failed to retrieve integration data. Please try again later.</p>
        <p className="text-sm text-muted-foreground mt-1">Error details: {error.message}</p>
      </div>
    )
  }

  const filteredIntegrations = integratedTools.filter((integration) => {
    const name = integration.tool?.name || ""
    const description = integration.tool?.description || ""
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !showActiveOnly || integration.isEnabled
    return matchesSearch && matchesFilter
  })

  const activeCount = integratedTools.filter((i) => i.isEnabled).length

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-start gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--ring),transparent_50%)] bg-[color-mix(in_srgb,var(--accent),transparent_60%)] px-2.5 py-1 text-xs text-foreground/90 backdrop-blur">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand-ring)]" />
                {activeCount} active
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDiscoverModal(true)}
                className="transition-transform hover:scale-[1.01]"
              >
                Discover Tools
              </Button>
              <CustomIntegrationPopover />
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search integration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>{showActiveOnly ? "Show All" : "Active Only"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={{
                  id: integration.id,
                  name: integration.tool!.name,
                  description: integration.tool!.description,
                  isActive: integration.isEnabled,
                }}
                onToggle={(id) =>
                  toggleIntegration.mutate({
                    id,
                    isEnabled: !integration.isEnabled
                  })
                }
                onConfigure={(id) => { }}
                isLoading={
                  toggleIntegration.isPending &&
                  toggleIntegration.variables?.id === integration.id
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),rgba(20,184,166,0.10),transparent_60%)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--ring),transparent_60%)]">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No integrations found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `No integrations match "${searchTerm}"`
                : "No integrations available"}
            </p>
          </div>
        )}
      </div>

      <DiscoverToolsModal
        open={showDiscoverModal}
        onOpenChange={setShowDiscoverModal}
      />
    </div>
  )
}
