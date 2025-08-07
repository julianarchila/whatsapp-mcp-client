"use client"

import { useState } from "react"
import { Search, Filter, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IntegrationCard, type Integration } from "./integration-card"
import { DiscoverToolsModal } from "./discover-tools-modal"
import { CustomIntegrationPopover } from "./custom-integration-popover"

interface IntegrationsSectionProps {
  integrations: Integration[]
  setIntegrations: React.Dispatch<React.SetStateAction<Integration[]>>
  onToggleIntegration: (id: string) => void
  onConfigureIntegration: (id: string) => void
}

const AVAILABLE_TOOLS = [
  {
    id: "figma",
    name: "Figma",
    description: "Design collaboratively with your team.",
    icon: Zap,
    category: "Design",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Track and manage your team's projects.",
    icon: Zap,
    category: "Productivity",
  },
];

export function IntegrationsSection({
  integrations,
  setIntegrations,
  onToggleIntegration,
  onConfigureIntegration,
}: IntegrationsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showDiscoverModal, setShowDiscoverModal] = useState(false)

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (integration.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    const matchesFilter = !showActiveOnly || integration.isActive
    return matchesSearch && matchesFilter
  })

  const handleAddCustomTool = (toolData: { name: string; url: string; apiKey: string }) => {
    const newIntegration: Integration = {
      id: `custom-${Date.now()}`,
      name: toolData.name,
      icon: Zap,
      category: "Personalizada",
      isActive: false,
    }
    setIntegrations(prev => [...prev, newIntegration])
  }

  const activeCount = integrations.filter((i) => i.isActive).length

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-start space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDiscoverModal(true)}
                className="ml-4"
              >
                Descubrir integraciones
              </Button>
              <CustomIntegrationPopover onAddTool={handleAddCustomTool} />
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar integración…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="flex items-center space-x-2 mr-4"
              >
                <Filter className="w-4 h-4" />
                <span>{showActiveOnly ? "Todas" : "Solo activas"}</span>
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
                integration={integration}
                onToggle={onToggleIntegration}
                onConfigure={onConfigureIntegration}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron integraciones
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `No hay integraciones que coincidan con "${searchTerm}"`
                : "No hay integraciones disponibles"}
            </p>
            {(searchTerm || showActiveOnly) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("")
                  setShowActiveOnly(false)
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      <DiscoverToolsModal
        open={showDiscoverModal}
        onOpenChange={setShowDiscoverModal}
        onAddTool={(toolId) => {
          // Add the tool to integrations when user clicks
          const newTool = AVAILABLE_TOOLS.find(tool => tool.id === toolId)
          if (newTool) {
            const integration = {
              id: newTool.id,
              name: newTool.name,
              icon: newTool.icon,
              category: newTool.category,
              isActive: false,
              isConfigured: false,
            }
            setIntegrations(prev => [...prev, integration])
            setShowDiscoverModal(false)
          }
        }}
      />
    </div>
  )
}
