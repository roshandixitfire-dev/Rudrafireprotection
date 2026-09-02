'use client'

import { useState, useEffect, useCallback } from 'react'

export interface DraftMetadata<T = any> {
    savedAt: string
    data: T
}

interface UseFormDraftOptions<T> {
    storageKey: string
    enabled?: boolean
    isEditingExisting?: boolean
    onRestore?: (data: T) => void
}

export function useFormDraft<T>({
    storageKey,
    enabled = true,
    isEditingExisting = false,
    onRestore
}: UseFormDraftOptions<T>) {
    const [hasDraft, setHasDraft] = useState(false)
    const [draftTime, setDraftTime] = useState<string | null>(null)
    const [savedDraftData, setSavedDraftData] = useState<T | null>(null)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null)

    // Check for draft on mount or key change
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return
        try {
            const raw = localStorage.getItem(storageKey)
            if (raw) {
                const parsed: DraftMetadata<T> = JSON.parse(raw)
                if (parsed && parsed.data) {
                    setHasDraft(true)
                    setSavedDraftData(parsed.data)
                    if (parsed.savedAt) {
                        const date = new Date(parsed.savedAt)
                        setDraftTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }))
                    }
                }
            } else {
                setHasDraft(false)
                setSavedDraftData(null)
                setDraftTime(null)
            }
        } catch (e) {
            console.error('Error reading form draft from localStorage:', e)
        }
    }, [storageKey, enabled])

    // Save draft
    const saveDraft = useCallback((formData: T) => {
        if (!enabled || typeof window === 'undefined') return
        try {
            const meta: DraftMetadata<T> = {
                savedAt: new Date().toISOString(),
                data: formData
            }
            localStorage.setItem(storageKey, JSON.stringify(meta))
            setIsDirty(true)
            const date = new Date()
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            setLastSavedNotice(`Draft auto-saved at ${timeStr}`)
        } catch (e) {
            console.error('Error saving form draft to localStorage:', e)
        }
    }, [storageKey, enabled])

    // Clear draft
    const clearDraft = useCallback(() => {
        if (typeof window === 'undefined') return
        try {
            localStorage.removeItem(storageKey)
            setHasDraft(false)
            setSavedDraftData(null)
            setDraftTime(null)
            setIsDirty(false)
            setLastSavedNotice(null)
        } catch (e) {
            console.error('Error clearing form draft:', e)
        }
    }, [storageKey])

    // Restore draft
    const restoreDraft = useCallback(() => {
        if (savedDraftData && onRestore) {
            onRestore(savedDraftData)
            setHasDraft(false) // Dismiss banner after restoring
        }
    }, [savedDraftData, onRestore])

    // Discard draft
    const discardDraft = useCallback(() => {
        clearDraft()
    }, [clearDraft])

    // Window beforeunload prompt when dirty
    useEffect(() => {
        if (!isDirty || typeof window === 'undefined') return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = 'You have unsaved changes in your draft. Are you sure you want to exit?'
            return e.returnValue
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [isDirty])

    return {
        hasDraft: hasDraft && !isEditingExisting,
        draftTime,
        savedDraftData,
        isDirty,
        lastSavedNotice,
        saveDraft,
        clearDraft,
        restoreDraft,
        discardDraft,
        setIsDirty
    }
}
