import { Github, Mail, MessageSquare, Calendar, Database, Slack, Zap, FileText, ShoppingCart, CreditCard } from "lucide-react";
import type { Integration } from "@/components/IntegrationCard";

/**
 * Mock data for available integrations
 * Each integration includes configuration fields that appear when activated
 */
export const mockIntegrations: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Sincroniza repositorios y gestiona pull requests automáticamente",
    icon: Github,
    isActive: true,
    configFields: [
      {
        label: "Token de acceso personal",
        key: "token",
        type: "password",
        placeholder: "ghp_xxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        label: "Usuario o organización",
        key: "owner",
        type: "text",
        placeholder: "mi-usuario",
        required: true,
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Automatiza emails y gestiona tu bandeja de entrada",
    icon: Mail,
    isActive: false,
    configFields: [
      {
        label: "Dirección de email",
        key: "email",
        type: "email",
        placeholder: "usuario@gmail.com",
        required: true,
      },
      {
        label: "Contraseña de aplicación",
        key: "password",
        type: "password",
        placeholder: "Contraseña específica de la app",
        required: true,
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Envía notificaciones y gestiona canales de equipo",
    icon: Slack,
    isActive: true,
    configFields: [
      {
        label: "Webhook URL",
        key: "webhook",
        type: "text",
        placeholder: "https://hooks.slack.com/services/...",
        required: true,
      },
      {
        label: "Canal por defecto",
        key: "channel",
        type: "text",
        placeholder: "#general",
      },
    ],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sincroniza eventos y programa reuniones automáticamente",
    icon: Calendar,
    isActive: false,
    configFields: [
      {
        label: "ID del calendario",
        key: "calendar_id",
        type: "text",
        placeholder: "usuario@gmail.com",
        required: true,
      },
      {
        label: "Clave API",
        key: "api_key",
        type: "password",
        placeholder: "AIzaSyxxxxxxxxxxxxxxxx",
        required: true,
      },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Crea y actualiza páginas, bases de datos y contenido",
    icon: FileText,
    isActive: false,
    configFields: [
      {
        label: "Token de integración",
        key: "token",
        type: "password",
        placeholder: "secret_xxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        label: "ID de la base de datos",
        key: "database_id",
        type: "text",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Envía mensajes y gestiona servidores de Discord",
    icon: MessageSquare,
    isActive: false,
    configFields: [
      {
        label: "Bot Token",
        key: "bot_token",
        type: "password",
        placeholder: "ODxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        label: "ID del servidor",
        key: "guild_id",
        type: "text",
        placeholder: "123456789012345678",
      },
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecta con miles de aplicaciones a través de Zapier",
    icon: Zap,
    isActive: false,
    configFields: [
      {
        label: "Webhook URL",
        key: "webhook_url",
        type: "text",
        placeholder: "https://hooks.zapier.com/hooks/catch/...",
        required: true,
      },
    ],
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Sincroniza datos con tus bases de datos de Airtable",
    icon: Database,
    isActive: false,
    configFields: [
      {
        label: "API Key",
        key: "api_key",
        type: "password",
        placeholder: "keyxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        label: "Base ID",
        key: "base_id",
        type: "text",
        placeholder: "appxxxxxxxxxxxxxxx",
        required: true,
      },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Gestiona productos, pedidos y clientes de tu tienda",
    icon: ShoppingCart,
    isActive: false,
    configFields: [
      {
        label: "Nombre de la tienda",
        key: "shop_name",
        type: "text",
        placeholder: "mi-tienda",
        required: true,
      },
      {
        label: "Access Token",
        key: "access_token",
        type: "password",
        placeholder: "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Procesa pagos y gestiona suscripciones",
    icon: CreditCard,
    isActive: false,
    configFields: [
      {
        label: "Clave secreta",
        key: "secret_key",
        type: "password",
        placeholder: "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        label: "Clave pública",
        key: "public_key",
        type: "text",
        placeholder: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
    ],
  },
];