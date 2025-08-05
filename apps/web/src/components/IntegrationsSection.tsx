import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IntegrationCard, type Integration } from "./IntegrationCard";
import { useState } from "react";

interface IntegrationsSectionProps {
  integrations: Integration[];
  onToggleIntegration: (id: string, isActive: boolean) => void;
  onSaveConfig: (id: string, config: Record<string, string>) => void;
}

/**
 * Main section component that displays all available integrations
 * Includes search and filter functionality
 */
export function IntegrationsSection({ 
  integrations, 
  onToggleIntegration, 
  onSaveConfig 
}: IntegrationsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Filter integrations based on search term and active filter
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !showActiveOnly || integration.isActive;
    
    return matchesSearch && matchesFilter;
  });

  const activeCount = integrations.filter(i => i.isActive).length;

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section header with stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Integraciones disponibles
              </h2>
              <p className="text-muted-foreground mt-1">
                {activeCount} de {integrations.length} integraciones activas
              </p>
            </div>
            
            {/* Search and filter controls */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar integración..."
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
                <span>{showActiveOnly ? "Todas" : "Solo activas"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Integrations grid */}
        {filteredIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onToggle={onToggleIntegration}
                onSave={onSaveConfig}
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
                : "No hay integraciones activas"
              }
            </p>
            {(searchTerm || showActiveOnly) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setShowActiveOnly(false);
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold text-foreground">{integrations.length}</p>
              </div>
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">🔗</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activas</p>
                <p className="text-2xl font-semibold text-chart-2">{activeCount}</p>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <span className="text-chart-2 text-sm">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {integrations.length - activeCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">⏸</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}