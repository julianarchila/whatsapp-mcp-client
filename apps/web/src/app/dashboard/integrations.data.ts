import {
  Github,
  Mail,
  MessageSquare,
  Calendar,
  Database,
  Slack,
  Zap,
  FileText,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import type { Integration } from "@/components/IntegrationCard";

/**
 * Mock data for available integrations
 */
export const mockIntegrations: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Sincroniza repositorios y gestiona pull requests automáticamente",
    icon: Github,
    isActive: true,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sincroniza eventos y programa reuniones automáticamente",
    icon: Calendar,
    isActive: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Crea y actualiza páginas, bases de datos y contenido",
    icon: FileText,
    isActive: true,
  },
];
