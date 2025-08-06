"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { LucideIcon } from "lucide-react"

export interface Integration {
  id: string
  name: string
  description: string
  icon: LucideIcon
  isActive: boolean
}

interface IntegrationCardProps {
  integration: Integration
  onToggle: (id: string) => void
  onConfigure: (id: string) => void
}

export function IntegrationCard({
  integration,
  onToggle,
  onConfigure,
}: IntegrationCardProps) {
  const IconComponent = integration.icon

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2 bg-muted rounded-lg">
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {integration.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigure(integration.id)}
            >
              Configurar
            </Button>
            <Switch
              checked={integration.isActive}
              onCheckedChange={() => onToggle(integration.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
