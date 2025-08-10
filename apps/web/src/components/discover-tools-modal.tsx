"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, Loader2 } from 'lucide-react'
import { ToolIcon } from '@/components/ui/tool-icon'
import { useAvailableTools, useIntegrations } from '@/hooks/use-tools'

interface DiscoverToolsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onToolAdded?: () => void // Callback to refresh parent data
}

export function DiscoverToolsModal({ open, onOpenChange, onToolAdded }: DiscoverToolsModalProps) {
    // Get tools that user hasn't integrated yet
    const { availableTools, isLoading, error } = useAvailableTools()

    // Integration mutations
    const { createIntegration, isCreating } = useIntegrations()

    const handleAddTool = async (toolId: string) => {
        // For now, we'll use a placeholder API key. In a real app, you'd collect this from the user
        const apiKey = prompt('Please enter your API key for this tool:')

        if (!apiKey) {
            return
        }

        createIntegration.mutate({
            toolId,
            apiKey,
            isEnabled: true
        }, {
            onSuccess: () => {
                onToolAdded?.()
            }
        })
    }

    if (error) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl font-semibold tracking-tight">
                            Discover and connect MCPs
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Failed to load tools. Please try again.</p>
                    </div>
                    <div className="flex justify-end pt-6 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-semibold tracking-tight">
                        Discover and connect MCPs
                    </DialogTitle>
                    <p className="text-muted-foreground text-sm">
                        Find new integrations to add to your workspace.
                    </p>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span className="text-muted-foreground">Loading available tools...</span>
                    </div>
                ) : availableTools.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">No new tools available to add.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableTools.map((tool) => (
                            <div
                                key={tool.id}
                                className="border rounded-lg p-6 hover:shadow-md transition-all hover:-translate-y-[1px]"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-2 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),rgba(20,184,166,0.10),transparent_60%)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--ring),transparent_60%)]">
                                        <ToolIcon toolName={tool.name} className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-medium text-base tracking-tight">{tool.name}</h3>
                                            <CheckCircle2 className="h-4 w-4 text-[var(--brand-ring)]" />
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {tool.description || 'No description available.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <Button
                                        onClick={() => handleAddTool(tool.id)}
                                        variant="outline"
                                        size="sm"
                                        className="transition-transform hover:scale-[1.01]"
                                        disabled={isCreating}
                                    >
                                        {isCreating ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        Add {tool.name}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}