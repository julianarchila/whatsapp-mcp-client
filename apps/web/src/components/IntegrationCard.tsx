import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  configFields?: {
    label: string;
    key: string;
    type: "text" | "email" | "password";
    placeholder: string;
    required?: boolean;
  }[];
}

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string, isActive: boolean) => void;
  onSave: (id: string, config: Record<string, string>) => void;
}

/**
 * Card component for displaying and configuring individual integrations
 * Shows integration info, toggle switch, and configuration form when active
 */
export function IntegrationCard({ integration, onToggle, onSave }: IntegrationCardProps) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const IconComponent = integration.icon;

  const handleToggle = (checked: boolean) => {
    onToggle(integration.id, checked);
    if (!checked) {
      setConfig({}); // Clear config when deactivating
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validate required fields
    const missingFields = integration.configFields?.filter(
      field => field.required && !config[field.key]
    );

    if (missingFields && missingFields.length > 0) {
      toast.error(`Campos requeridos: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(integration.id, config);
      toast.success(`${integration.name} se ha configurado correctamente.`);
    } catch (error) {
      toast.error("No se pudo guardar la configuración. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-card-border transition-all duration-200 hover:shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">{integration.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {integration.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              integration.isActive 
                ? "bg-chart-2/10 text-chart-2" 
                : "bg-destructive/10 text-destructive"
            }`}>
              {integration.isActive ? "Activa" : "Inactiva"}
            </span>
            <Switch
              checked={integration.isActive}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-chart-2"
            />
          </div>
        </div>
      </CardHeader>

      {/* Configuration form appears when integration is active */}
      {integration.isActive && integration.configFields && (
        <CardContent className="pt-0">
          <div className="space-y-4 pt-4 border-t border-card-border">
            <h4 className="font-medium text-sm">Configuración</h4>
            
            <div className="space-y-3">
              {integration.configFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={config[field.key] || ""}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}