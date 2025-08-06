"use client"

import { useForm } from "@tanstack/react-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import z from "zod"

interface NewTool {
  id: string
  name: string
  description: string
  url: string
  apiKey: string
}

interface AddToolFormProps {
  onAddTool: (tool: NewTool) => void
}

export function AddToolForm({ onAddTool }: AddToolFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      url: "",
      apiKey: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))

        const newTool: NewTool = {
          id: `custom-${Date.now()}`,
          name: value.name,
          description: value.description,
          url: value.url,
          apiKey: value.apiKey,
        }

        onAddTool(newTool)
        toast.success("¡Herramienta añadida exitosamente!")

        form.reset()
      } catch (error) {
        console.error("Error al añadir la herramienta:", error)
        toast.error("Error al añadir la herramienta")
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string()
          .min(1, "El nombre es obligatorio")
          .min(2, "El nombre debe tener al menos 2 caracteres"),
        description: z.string()
          .min(1, "La descripción es obligatoria")
          .min(10, "La descripción debe tener al menos 10 caracteres")
          .max(200, "La descripción no puede exceder 200 caracteres"),
        url: z.string()
          .min(1, "La URL es obligatoria")
          .url("Por favor ingresa una URL válida"),
        apiKey: z.string()
          .min(1, "La API Key es obligatoria")
          .min(8, "La API Key debe tener al menos 8 caracteres"),
      }),
    },
  })

  const handleClear = () => {
    form.reset()
    toast.info("Formulario limpiado")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Añadir Herramienta Personalizada
        </h2>
        <p className="text-muted-foreground">
          ¿No encuentras la herramienta que necesitas? Crea tu propia integración personalizada
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva Integración
          </CardTitle>
          <CardDescription>
            Completa la información de tu herramienta para crear una integración personalizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Campo Nombre */}
            <div>
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Nombre de la herramienta
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="ej. Mi Herramienta Personalizada"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={field.state.meta.errors.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {field.state.meta.errors.map((error) => (
                      <div key={error?.message} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {error?.message}
                      </div>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Descripción
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="Describe qué hace tu herramienta y cómo ayudará en tu flujo de trabajo..."
                      rows={3}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={field.state.meta.errors.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {field.state.meta.errors.map((error) => (
                      <div key={error?.message} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {error?.message}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      {field.state.value.length}/200 caracteres
                    </p>
                  </div>
                )}
              </form.Field>
            </div>

            {/* Campo URL */}
            <div>
              <form.Field name="url">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      URL del MCP
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      placeholder="https://api.miherramienta.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={field.state.meta.errors.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {field.state.meta.errors.map((error) => (
                      <div key={error?.message} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {error?.message}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      URL base de la API de tu herramienta
                    </p>
                  </div>
                )}
              </form.Field>
            </div>

            {/* Campo API Key */}
            <div>
              <form.Field name="apiKey">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      API Key
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="sk-..."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={field.state.meta.errors.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {field.state.meta.errors.map((error) => (
                      <div key={error?.message} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {error?.message}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Tu clave de API para autenticar las solicitudes
                    </p>
                  </div>
                )}
              </form.Field>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Seguridad:</strong> Tu API Key se almacena de forma segura y encriptada.
                Solo se utilizará para las integraciones que configures.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 pt-4">
              <form.Subscribe>
                {(state) => (
                  <Button
                    type="submit"
                    disabled={!state.canSubmit || state.isSubmitting}
                    className="flex-1"
                  >
                    {state.isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Añadiendo herramienta...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Herramienta
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>

              <form.Subscribe>
                {(state) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    disabled={state.isSubmitting}
                  >
                    Limpiar
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
