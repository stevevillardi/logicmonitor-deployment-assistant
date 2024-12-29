import React, { createContext, useContext } from 'react'
import { useDeployments as useDeploymentsHook, type Deployment } from '../hooks/useDeployments'

export type { Deployment }

const DeploymentsContext = createContext<ReturnType<typeof useDeploymentsHook> | null>(null)

export function DeploymentsProvider({ children }: { children: React.ReactNode }) {
    const deployments = useDeploymentsHook()
    return (
        <DeploymentsContext.Provider value={deployments}>
            {children}
        </DeploymentsContext.Provider>
    )
}

export function useDeployments() {
    const context = useContext(DeploymentsContext)
    if (!context) {
        throw new Error('useDeployments must be used within a DeploymentsProvider')
    }
    return context
} 