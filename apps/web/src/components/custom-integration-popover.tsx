"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, AlertCircle } from 'lucide-react'
import { toast } from "sonner"
import z from "zod"

interface CustomIntegrationPopoverProps {
    onAddTool: (toolData: { name: string; url: string; apiKey: string }) => void
}

export function CustomIntegrationPopover({ onAddTool }: CustomIntegrationPopoverProps) {
    const [open, setOpen] = useState(false)

    const form = useForm({
        defaultValues: {
            name: "",
            url: "",
            apiKey: "",
        },
        onSubmit: async ({ value }) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000))

                onAddTool(value)

                toast.success("¡Herramienta añadida exitosamente!")

                form.reset()
                setOpen(false)
            } catch (error) {
                console.error("Error:", error)
                toast.error("Error al añadir la herramienta")
            }
        },
        validators: {
            onSubmit: z.object({
                name: z.string()
                    .min(1, "El nombre es obligatorio")
                    .min(2, "El nombre debe tener al menos 2 caracteres"),
                url: z.string()
                    .min(1, "La URL es obligatoria")
                    .url("Por favor ingresa una URL válida"),
                apiKey: z.string()
                    .min(1, "La API Key es obligatoria")
                    .min(8, "La API Key debe tener al menos 8 caracteres"),
            }),
        },
    })

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            form.reset()
        }
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir integración
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Nueva integración</h4>
                        <p className="text-sm text-muted-foreground">
                            Añade tu herramienta personalizada
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-3"
                    >
                        <div>
                            <form.Field name="name">
                                {(field) => (
                                    <div className="space-y-1">
                                        <Label htmlFor={field.name} className="text-xs">
                                            Nombre
                                        </Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            placeholder="Mi herramienta"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={`h-8 text-sm ${field.state.meta.errors.length > 0
                                                ? "border-red-500 focus-visible:ring-red-500"
                                                : ""
                                                }`}
                                        />
                                        {field.state.meta.errors.map((error) => (
                                            <div key={error?.message} className="flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {error?.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div>
                            <form.Field name="url">
                                {(field) => (
                                    <div className="space-y-1">
                                        <Label htmlFor={field.name} className="text-xs">
                                            URL API
                                        </Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="url"
                                            placeholder="https://api.ejemplo.com/mcp"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={`h-8 text-sm ${field.state.meta.errors.length > 0
                                                ? "border-red-500 focus-visible:ring-red-500"
                                                : ""
                                                }`}
                                        />
                                        {field.state.meta.errors.map((error) => (
                                            <div key={error?.message} className="flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {error?.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        {/* Campo API Key */}
                        <div>
                            <form.Field name="apiKey">
                                {(field) => (
                                    <div className="space-y-1">
                                        <Label htmlFor={field.name} className="text-xs">
                                            API Key
                                        </Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="password"
                                            placeholder="sk-..."
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={`h-8 text-sm ${field.state.meta.errors.length > 0
                                                ? "border-red-500 focus-visible:ring-red-500"
                                                : ""
                                                }`}
                                        />
                                        {field.state.meta.errors.map((error) => (
                                            <div key={error?.message} className="flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {error?.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div className="flex justify-end pt-2">
                            <form.Subscribe>
                                {(state) => (
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={!state.canSubmit || state.isSubmitting}
                                        className="h-8"
                                    >
                                        {state.isSubmitting ? "Añadiendo..." : "Añadir"}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </div>
                    </form>
                </div>
            </PopoverContent>
        </Popover>
    )
}