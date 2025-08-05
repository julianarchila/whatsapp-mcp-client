"use client"
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { IntegrationsSection } from "@/components/IntegrationsSection";
import { mockIntegrations } from "./integrations.data";
import type { Integration } from "@/components/IntegrationCard";

export default function Dashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  // Handle toggling integration on/off
  const handleToggleIntegration = (id: string, isActive: boolean) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id ? { ...integration, isActive } : integration
      )
    );
  };

  // Handle saving integration configuration
  const handleSaveConfig = async (id: string, config: Record<string, string>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would send this to your backend
    console.log(`Saving config for ${id}:`, config);
    
    // Update local state to show the integration is configured
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id 
          ? { ...integration, isConfigured: true } 
          : integration
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <IntegrationsSection
        integrations={integrations}
        onToggleIntegration={handleToggleIntegration}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
