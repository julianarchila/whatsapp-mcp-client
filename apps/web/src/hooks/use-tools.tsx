import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTRPC} from '@/lib/trpc/client'

// ============================================================================
// TOOLS HOOKS
// ============================================================================

export const useTools = () => {

    const trpc = useTRPC()
    const queryClient = useQueryClient()
    // Queries
    const getAllTools = () =>
        useQuery(trpc.tool.getAll.queryOptions())

    const getToolById = (id: string) =>
        useQuery(trpc.tool.getById.queryOptions({ id }, { enabled: !!id }))

    const searchTools = (query: string, enabled = true) =>
        useQuery(trpc.tool.search.queryOptions({ query }, { enabled: enabled && query.length > 0 }))

    const getMyTools = () => useQuery(trpc.tool.getMyTools.queryOptions())

    // Mutations
    const createTool = useMutation(trpc.tool.create.mutationOptions({
        onSuccess: () => {
            toast.success('Tool created successfully!')
            queryClient.invalidateQueries({ queryKey: trpc.tool.getAll.queryKey() })
        },
        onError: (error) => {
            toast.error('Failed to create tool: ' + error.message)
        }
    }))

    const updateTool = useMutation(trpc.tool.update.mutationOptions({
        onSuccess: () => {
            toast.success('Tool updated successfully!')
            queryClient.invalidateQueries({ queryKey: trpc.tool.getAll.queryKey() })
        },
        onError: (error) => {
            toast.error('Failed to update tool: ' + error.message)
        }
    }))

    const deleteTool = useMutation(trpc.tool.delete.mutationOptions({
        onSuccess: () => {
            toast.success('Tool deleted successfully!')
            queryClient.invalidateQueries({ queryKey: trpc.tool.getAll.queryKey() })
        },
        onError: (error) => {
            toast.error('Failed to delete tool: ' + error.message)
        }
    }))

    return {
        // Queries
        getAllTools,
        getToolById,
        searchTools,
        getMyTools,

        // Mutations
        createTool,
        updateTool,
        deleteTool,

        // Utils for manual invalidation
        invalidateTools: () => queryClient.invalidateQueries({ queryKey: trpc.tool.getAll.queryKey() }),

        // Loading states
        isCreating: createTool.isPending,
        isUpdating: updateTool.isPending,
        isDeleting: deleteTool.isPending,
    }
}

// ============================================================================
// INTEGRATIONS HOOKS
// ============================================================================

export const useIntegrations = () => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Queries
    const getAllIntegrations = () =>
        useQuery(trpc.integration.getAll.queryOptions())

    const getIntegrationById = (id: string) =>
        useQuery(trpc.integration.getById.queryOptions({ id }, { enabled: !!id }))

    const getIntegrationByToolId = (toolId: string) =>
        useQuery(trpc.integration.getByToolId.queryOptions({ toolId }, { enabled: !!toolId }))

    // Mutations
    const createIntegration = useMutation(trpc.integration.create.mutationOptions({
        onSuccess: () => {
            toast.success('Integration created successfully!')
            queryClient.invalidateQueries({ queryKey: trpc.integration.getAll.queryKey() })
        },
        onError: (error: any) => {
            toast.error('Failed to create integration: ' + error.message)
        }
    }))

    const updateIntegration = useMutation(trpc.integration.update.mutationOptions({
        onSuccess: () => {
            toast.success('Integration updated successfully!')
            queryClient.invalidateQueries({ queryKey: trpc.integration.getAll.queryKey() })
        },
        onError: (error: any) => {
            toast.error('Failed to update integration: ' + error.message)
        }
    }))

    const toggleIntegration = useMutation(trpc.integration.toggleEnabled.mutationOptions({
        onSuccess: (data: any, variables: { isEnabled: boolean }) => {
            const status = variables.isEnabled ? 'enabled' : 'disabled'
            toast.success(`Integration ${status} successfully!`)
            queryClient.invalidateQueries({ queryKey: trpc.integration.getAll.queryKey() })
        },
        onError: (error: any) => {
            toast.error('Failed to toggle integration: ' + error.message)
        }
    }))

    const deleteIntegration = useMutation(trpc.integration.delete.mutationOptions({
        onSuccess: () => {
            toast.success('Integration deleted successfully!')
            queryClient.invalidateQueries({ queryKey: trpc.integration.getAll.queryKey() })
        },
        onError: (error: any) => {
            toast.error('Failed to delete integration: ' + error.message)
        }
    }))

    return {
        // Queries
        getAllIntegrations,
        getIntegrationById,
        getIntegrationByToolId,

        // Mutations
        createIntegration,
        updateIntegration,
        toggleIntegration,
        deleteIntegration,

        // Utils for manual invalidation
        invalidateIntegrations: () => queryClient.invalidateQueries({ queryKey: trpc.integration.getAll.queryKey() }),

        // Loading states
        isCreating: createIntegration.isPending,
        isUpdating: updateIntegration.isPending,
        isToggling: toggleIntegration.isPending,
        isDeleting: deleteIntegration.isPending,
    }
}

// ============================================================================
// COMBINED HOOKS FOR COMMON USE CASES
// ============================================================================

/**
 * Hook for discovering new tools that haven't been integrated yet
 */
export const useAvailableTools = () => {
    const { getAllTools } = useTools()
    const { getAllIntegrations } = useIntegrations()

    const allTools = getAllTools()
    const integrations = getAllIntegrations()

    const availableTools = allTools?.data?.filter((tool: any) => {
        const hasIntegration = integrations?.data?.some((integration: any) =>
            integration.toolId === tool.id
        )
        return !hasIntegration
    }) || []

    return {
        availableTools,
        isLoading: allTools?.isLoading || integrations?.isLoading,
        error: allTools?.error || integrations?.error,
    }
}

/**
 * Hook for getting integrated tools with tool details
 */
export const useIntegratedTools = () => {
    const { getAllTools } = useTools()
    const { getAllIntegrations } = useIntegrations()

    const allTools = getAllTools()
    const integrations = getAllIntegrations()

    const integratedTools = integrations?.data?.map((integration: any) => {
        const tool = allTools?.data?.find((tool: any) => tool.id === integration.toolId)
        return {
            ...integration,
            tool: tool || null,
        }
    }).filter((item: any) => item.tool !== null) || []

    return {
        integratedTools,
        isLoading: allTools?.isLoading || integrations?.isLoading,
        error: allTools?.error || integrations?.error,
    }
}