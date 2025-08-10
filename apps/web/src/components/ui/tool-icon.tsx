import {
    FileText,
    Figma,
    GitBranch,
    Github,
    Trello,
    MessageCircle,
    Video,
    Palette,
    Slack,
    Calendar,
    Database,
    Mail,
    Cloud,
    Code,
    Bug,
    Smartphone,
    Monitor,
    Globe,
    Zap,
    Image,
    Music,
    BookOpen,
    ShoppingCart,
    CreditCard,
    Users,
    BarChart,
    PieChart,
    Calculator,
    Clock,
    Lock,
    Shield,
    Camera,
    Headphones,
    Gamepad2,
    Truck,
    MapPin,
    Phone,
    Search,
    Filter,
    Upload,
    Download,
    Share2,
    Heart,
    Star,
    ThumbsUp,
    MessageSquare,
    Bell,
    Wifi,
    Battery,
    Cpu,
    HardDrive,
    Server,
    Terminal,
    Layers,
    Grid,
    Layout,
    Package,
    Settings,
    CheckCircle2,
    type LucideIcon
} from 'lucide-react'

// Icon mapping based on tool names (case-insensitive)
const ICON_MAP: Record<string, LucideIcon> = {
    // Design & Creative
    'figma': Figma,
    'adobe': Palette,
    'photoshop': Image,
    'illustrator': Palette,
    'sketch': Palette,
    'canva': Image,
    'dribbble': Palette,
    'behance': Palette,
    'invision': Layout,
    'framer': Layout,
    'miro': Grid,
    'mural': Palette,

    // Development
    'github': Github,
    'gitlab': GitBranch,
    'bitbucket': Code,
    'linear': GitBranch,
    'jira': Bug,
    'confluence': FileText,
    'notion': FileText,
    'vs code': Code,
    'vscode': Code,
    'terminal': Terminal,
    'docker': Package,
    'kubernetes': Server,
    'jenkins': Settings,
    'circleci': Settings,
    'travis': Settings,
    'npm': Package,
    'yarn': Package,
    'webpack': Package,

    // Project Management
    'trello': Trello,
    'asana': CheckCircle2,
    'monday': Calendar,
    'clickup': CheckCircle2,
    'basecamp': Package,
    'todoist': CheckCircle2,
    'airtable': Database,
    'smartsheet': Grid,

    // Communication
    'slack': Slack,
    'discord': MessageCircle,
    'teams': MessageCircle,
    'zoom': Video,
    'meet': Video,
    'skype': Video,
    'telegram': MessageCircle,
    'whatsapp': MessageCircle,
    'messenger': MessageCircle,
    'hangouts': Video,

    // Analytics & Data
    'analytics': BarChart,
    'google analytics': BarChart,
    'mixpanel': PieChart,
    'amplitude': BarChart,
    'tableau': BarChart,
    'power bi': PieChart,
    'looker': BarChart,
    'database': Database,
    'mysql': Database,
    'postgresql': Database,
    'mongodb': Database,
    'redis': Database,
    'elasticsearch': Search,

    // Cloud & Infrastructure
    'aws': Cloud,
    'amazon': Cloud,
    'azure': Cloud,
    'google cloud': Cloud,
    'gcp': Cloud,
    'heroku': Cloud,
    'netlify': Globe,
    'vercel': Globe,
    'cloudflare': Shield,
    'digitalocean': Cloud,
    'linode': Server,

    // E-commerce & Finance
    'shopify': ShoppingCart,
    'stripe': CreditCard,
    'paypal': CreditCard,
    'square': CreditCard,
    'woocommerce': ShoppingCart,
    'magento': ShoppingCart,
    'bigcommerce': ShoppingCart,

    // Email & Marketing
    'mailchimp': Mail,
    'sendgrid': Mail,
    'hubspot': Users,
    'salesforce': Users,
    'intercom': MessageSquare,
    'zendesk': Headphones,
    'freshdesk': Headphones,
    'klaviyo': Mail,
    'constant contact': Mail,

    // Media & Entertainment
    'spotify': Music,
    'apple music': Music,
    'youtube': Video,
    'twitch': Video,
    'netflix': Video,
    'soundcloud': Headphones,
    'vimeo': Video,
    'tiktok': Video,

    // Productivity
    'google': Globe,
    'microsoft': Package,
    'office': FileText,
    'office 365': FileText,
    'dropbox': Cloud,
    'drive': HardDrive,
    'google drive': HardDrive,
    'onedrive': Cloud,
    'box': Package,
    'evernote': BookOpen,
    'obsidian': BookOpen,

    // Social Media
    'twitter': MessageSquare,
    'facebook': Users,
    'instagram': Camera,
    'linkedin': Users,
    'pinterest': Image,
    'snapchat': Camera,
    'reddit': MessageSquare,

    // Security & Auth
    'auth0': Lock,
    'okta': Shield,
    'firebase': Zap,
    '1password': Lock,
    'lastpass': Lock,
    'bitwarden': Shield,

    // Default fallbacks by category
    'api': Zap,
    'webhook': Wifi,
    'service': Settings,
    'tool': Package,
    'app': Smartphone,
    'web': Globe,
    'mobile': Smartphone,
    'desktop': Monitor,
    'server': Server,
    'bot': Settings,
    'ai': Cpu,
    'ml': Cpu,
    'machine learning': Cpu,
    'artificial intelligence': Cpu,
}

/**
 * Gets the appropriate icon for a tool based on its name
 * @param toolName - The name of the tool
 * @returns Lucide icon component
 */
export function getToolIcon(toolName: string): LucideIcon {
    if (!toolName) return Package

    const normalizedName = toolName.toLowerCase().trim()

    // Try exact match first
    if (ICON_MAP[normalizedName]) {
        return ICON_MAP[normalizedName]
    }

    // Try partial matches (tool name contains key or key contains tool name)
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return icon
        }
    }

    // Default icon
    return Package
}

interface ToolIconProps {
    toolName: string
    className?: string
    size?: number
}

/**
 * ToolIcon component that renders the appropriate icon for a given tool name
 */
export function ToolIcon({ toolName, className = "h-6 w-6", size }: ToolIconProps) {
    const Icon = getToolIcon(toolName)

    return (
        <Icon
            className={className}
            size={size}
        />
    )
}

// Export the icon map for direct access if needed
export { ICON_MAP }

// Type exports for better TypeScript support
export type { LucideIcon }