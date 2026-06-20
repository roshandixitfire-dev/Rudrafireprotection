'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsedState] = useState(false)

    // Load preference from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('sidebar-collapsed')
        if (stored !== null) {
            setIsCollapsedState(stored === 'true')
        }
    }, [])

    const setIsCollapsed = (value: boolean) => {
        setIsCollapsedState(value)
        localStorage.setItem('sidebar-collapsed', String(value))
    }

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}
