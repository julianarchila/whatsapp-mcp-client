"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ToolIcon } from '@/components/ui/tool-icon'
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { MoreVertical, Settings, Trash2 } from "lucide-react"
import { useIntegrations } from "@/hooks/use-integrations"

export interface Integration {
  id: string
  name: string
  description?: string
  isEnabled: boolean
}

interface IntegrationCardProps {
  integration: Integration
  onToggle: (id: string) => void
  isLoading?: boolean
}

export function IntegrationCard({
  integration,
  onToggle,
  isLoading = false,
}: IntegrationCardProps) {

  const { deleteIntegration } = useIntegrations()

  const setConfiguring = (id: string) => {
    // Logic to set the integration for configuration
  }

  return (
    <Card className="border border-muted/60 transition-all hover:-translate-y-[1px] hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),rgba(20,184,166,0.10),transparent_60%)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--ring),transparent_60%)]">
                <ToolIcon toolName={integration.name} className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="bold text-lg tracking-tight">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={integration.isEnabled}
              onCheckedChange={() => onToggle(integration.id)}
              isLoading={isLoading}
              disabled={isLoading}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Manage {integration.name}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2"
                    onClick={() => setConfiguring(integration.id)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2 text-red-600 hover:text-red-600 dark:text-red-700 dark:hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteIntegration.mutate({ id: integration.id })}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
