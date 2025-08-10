import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

// ============================================================================
// TOOLS HOOKS
// ============================================================================

export const useTools = () => {
    const utils = trpc.useUtils()

    // Queries
    const getAllTools = () => trpc.tool.getAll.useQuery()

    const getToolById = (id: string) =>
        trpc.tool.getById.useQuery(
            { id },
            { enabled: !!id }
        )

    const searchTools = (query: string, enabled = true) =>
        trpc.tool.search.useQuery(
            { query },
            { enabled: enabled && query.length > 0 }
        )

    const getMyTools = () => trpc.tool.getMyTools.useQuery()

    // Mutations
    const createTool = trpc.tool.create.useMutation({
        onSuccess: () => {
            toast.success('Tool created successfully!')
            utils.tool.invalidate()
        },
        onError: (error) => {
            toast.error('Failed to create tool: ' + error.message)
        }
    })

    const updateTool = trpc.tool.update.useMutation({
        onSuccess: () => {
            toast.success('Tool updated successfully!')
            utils.tool.invalidate()
        },
        onError: (error) => {
            toast.error('Failed to update tool: ' + error.message)
        }
    })

    const deleteTool = trpc.tool.delete.useMutation({
        onSuccess: () => {
            toast.success('Tool deleted successfully!')
            utils.tool.invalidate()
        },
        onError: (error) => {
            toast.error('Failed to delete tool: ' + error.message)
        }
    })

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
        invalidateTools: () => utils.tool.invalidate(),

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
    const utils = trpc.useUtils()

    // Queries
    const getAllIntegrations = () => trpc.integration.getAll.useQuery()

    const getIntegrationById = (id: string) =>
        trpc.integration.getById.useQuery(
            { id },
            { enabled: !!id }
        )

    const getIntegrationByToolId = (toolId: string) =>
        trpc.integration.getByToolId.useQuery(
            { toolId },
            { enabled: !!toolId }
        )

    // Mutations
    const createIntegration = trpc.integration.create.useMutation({
        onSuccess: () => {
            toast.success('Integration created successfully!')
            utils.integration.invalidate()
        },
        onError: (error) => {
            toast.error('Failed to create integration: ' + error.message)
        }
    })

    const updateIntegration = trpc.integration.update.useMutation({
        onSuccess: () => {
            toast.success('Integration updated successfully!')
            utils.integration.invalidate()
        },
        onError: (error) => {
            toast.error('Failed to update integration: ' + error.message)
        }
    })

    const toggleIntegration = trpc.integration.toggleEnabled.useMutation({
        onSuccess: (_, variables) => {
            const status = variables.isEnabled ? 'enabled' : 'disabled'
            toast.success(`Integration ${status} successfully!`)
            utils.integration.invalidate()
        },
        onError: (error) => {
            toast.error('Failed to toggle integration: ' + error.message)
        }
    })

    const deleteIntegration = trpc.integration.delete.useMutation({
        onSuccess: () => {
            toast.success('Integration deleted successfully!')
            utils.integration.invalidate()
        },
        onError: (error) => {
            toast.error('Failed to delete integration: ' + error.message)
        }
    })

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
        invalidateIntegrations: () => utils.integration.invalidate(),

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

    const availableTools = allTools.data?.filter(tool => {
        const hasIntegration = integrations.data?.some(integration =>
            integration.toolId === tool.id
        )
        return !hasIntegration
    }) || []

    return {
        availableTools,
        isLoading: allTools.isLoading || integrations.isLoading,
        error: allTools.error || integrations.error,
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

    const integratedTools = integrations.data?.map(integration => {
        const tool = allTools.data?.find(tool => tool.id === integration.toolId)
        return {
            ...integration,
            tool: tool || null,
        }
    }).filter(item => item.tool !== null) || []

    return {
        integratedTools,
        isLoading: allTools.isLoading || integrations.isLoading,
        error: allTools.error || integrations.error,
    }
}