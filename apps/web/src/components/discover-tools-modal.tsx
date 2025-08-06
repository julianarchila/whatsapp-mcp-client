"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle2 } from 'lucide-react'
import { FileText, Figma, GitBranch, Github, Trello, MessageCircle, Video, Palette } from 'lucide-react'

// Herramientas disponibles para añadir
export const AVAILABLE_TOOLS = [
    {
        id: "figma",
        name: "Figma",
        description: "Design and collaboration platform for teams.",
        icon: Figma,
        category: "Diseño",
        verified: true,
    },
    {
        id: "linear",
        name: "Linear",
        description: "Issue tracking and project management for development teams.",
        icon: GitBranch,
        category: "Desarrollo",
        verified: true,
    },
    {
        id: "trello",
        name: "Trello",
        description: "Visual project management with boards, lists, and cards.",
        icon: Trello,
        category: "Productividad",
        verified: true,
    },
    {
        id: "discord",
        name: "Discord",
        description: "Voice, video, and text communication for communities.",
        icon: MessageCircle,
        category: "Comunicación",
        verified: true,
    },
    {
        id: "zoom",
        name: "Zoom",
        description: "Video conferencing and online meeting platform.",
        icon: Video,
        category: "Comunicación",
        verified: true,
    },
    {
        id: "adobe-creative",
        name: "Adobe Creative Suite",
        description: "Professional creative tools for design and content creation.",
        icon: Palette,
        category: "Diseño",
        verified: true,
    },
]

interface DiscoverToolsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddTool: (toolId: string) => void
}

export function DiscoverToolsModal({ open, onOpenChange, onAddTool }: DiscoverToolsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black border-gray-800">
                <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-bold text-white">
                        Descubre herramientas
                    </DialogTitle>
                    <p className="text-gray-400 text-base">
                        Añade nuevas herramientas a tu flujo de trabajo para potenciar tu productividad
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_TOOLS.map((tool) => {
                        const Icon = tool.icon
                        return (
                            <div
                                key={tool.id}
                                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-2 bg-gray-800 rounded-lg">
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-white text-lg">{tool.name}</h3>
                                            {tool.verified && (
                                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                                        {tool.category}
                                    </Badge>
                                    <Button
                                        onClick={() => onAddTool(tool.id)}
                                        className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add {tool.name} to Cursor
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-800">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
