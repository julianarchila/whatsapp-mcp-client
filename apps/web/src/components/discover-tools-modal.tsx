"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { ToolIcon } from '@/components/ui/tool-icon'
import { Input } from "@/components/ui/input"
import { useAvailableTools, useIntegrations } from '@/hooks/use-tools'

interface DiscoverToolsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onToolAdded?: () => void
}

export function DiscoverToolsModal({ open, onOpenChange, onToolAdded }: DiscoverToolsModalProps) {
    const { availableTools, isLoading, error } = useAvailableTools()
    const { createIntegration, isCreating } = useIntegrations()

    // Controla si estamos en la vista principal o pidiendo API key
    const [selectedTool, setSelectedTool] = useState<{ id: string; name: string } | null>(null)
    const [apiKey, setApiKey] = useState("")

    const handleCreateIntegration = () => {
        if (!selectedTool || !apiKey) return

        createIntegration.mutate(
            {
                toolId: selectedTool.id,
                apiKey,
                isEnabled: true,
            },
            {
                onSuccess: () => {
                    setSelectedTool(null)
                    setApiKey("")
                    onToolAdded?.()
                },
            }
        )
    }

    const renderMainView = () => (
        <>
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
                                    onClick={() => setSelectedTool({ id: tool.id, name: tool.name })}
                                    variant="outline"
                                    size="sm"
                                    className="transition-transform hover:scale-[1.01]"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add {tool.name}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )

    const renderApiKeyView = () => (
        <>
            <DialogHeader className="pb-6 flex flex-row justify-start items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setSelectedTool(null)
                        setApiKey("")
                    }}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-lg font-semibold">
                    Connect {selectedTool?.name}
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Enter the API key for {selectedTool?.name} to finish connecting it to your workspace.
                </p>
                <Input
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isCreating}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedTool(null)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateIntegration} disabled={!apiKey || isCreating}>
                        {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Connect
                    </Button>
                </div>
            </div>
        </>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                {error ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Failed to load tools. Please try again.</p>
                    </div>
                ) : selectedTool ? renderApiKeyView() : renderMainView()}

                {!selectedTool && (
                    <div className="flex justify-end pt-6 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
