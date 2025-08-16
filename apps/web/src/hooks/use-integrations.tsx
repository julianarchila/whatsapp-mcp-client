import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'

// ============================================================================
// INTEGRATIONS HOOKS
// ============================================================================

export const useIntegrations = () => {
    const utils = trpc.useUtils()

    // Queries
    const getAllIntegrations = trpc.integration.getAll

    const getIntegrationById = trpc.integration.getById

    const getIntegrationByName = trpc.integration.getByName

    // Mutations
    const createIntegration = trpc.integration.create.useMutation({
        onSuccess: () => {
            toast.success('Integration created successfully!')
            utils.integration.getAll.invalidate()
        },
        onError: (error: any) => {
            if (error.data?.code === 'CONFLICT') {
                toast.error('Integration name already exists. Please choose a different name.')
            } else {
                toast.error('Failed to create integration: ' + error.message)
            }
        }
    })

    const updateIntegration = trpc.integration.update.useMutation({
        onSuccess: () => {
            toast.success('Integration updated successfully!')
            utils.integration.getAll.invalidate()
        },
        onError: (error: any) => {
            toast.error('Failed to update integration: ' + error.message)
        }
    })

    const toggleIntegration = trpc.integration.toggleEnabled.useMutation({
        onSuccess: (data: any, variables: { isEnabled: boolean }) => {
            const status = variables.isEnabled ? 'enabled' : 'disabled'
            toast.success(`Integration ${status} successfully!`)
            utils.integration.getAll.invalidate()
        },
        onError: (error: any) => {
            toast.error('Failed to toggle integration: ' + error.message)
        }
    })

    const deleteIntegration = trpc.integration.delete.useMutation({
        onSuccess: () => {
            toast.success('Integration deleted successfully!')
            utils.integration.getAll.invalidate()
        },
        onError: (error: any) => {
            toast.error('Failed to delete integration: ' + error.message)
        }
    })

    return {
        // Queries
        getAllIntegrations,
        getIntegrationById,
        getIntegrationByName,

        // Mutations
        createIntegration,
        updateIntegration,
        toggleIntegration,
        deleteIntegration,

        // Utils for manual invalidation
        invalidateIntegrations: () => utils.integration.getAll.invalidate(),

        // Loading states
        isCreating: createIntegration.isPending,
        isUpdating: updateIntegration.isPending,
        isToggling: toggleIntegration.isPending,
        isDeleting: deleteIntegration.isPending,
    }
}