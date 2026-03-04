'use client'

import React, { useState, useEffect } from 'react'
import {
    X,
    Trash2,
    RefreshCcw,
    User,
    Calendar,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Info
} from 'lucide-react'
import { getDeletionLogsAction, restoreClientAction } from '@/app/dashboard/clients/actions'

interface DeletionLogsModalProps {
    isOpen: boolean
    onClose: () => void
}

export const DeletionLogsModal: React.FC<DeletionLogsModalProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [restoringId, setRestoringId] = useState<number | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const fetchLogs = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getDeletionLogsAction()
            if (result.success) {
                setLogs(result.data || [])
            } else {
                setError(result.error || 'Failed to fetch deletion logs')
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchLogs()
            setSuccessMessage(null)
        }
    }, [isOpen])

    const handleRestore = async (logId: number) => {
        setRestoringId(logId)
        setError(null)
        try {
            const result = await restoreClientAction(logId)
            if (result.success) {
                setSuccessMessage('Client restored successfully!')
                fetchLogs() // Refresh the list
                setTimeout(() => setSuccessMessage(null), 3000)
            } else {
                setError(result.error || 'Failed to restore client')
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during restoration')
        } finally {
            setRestoringId(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-none">Deletion Audit Log</h2>
                            <p className="text-xs text-slate-400 mt-1 font-medium italic">Track and restore deleted client records</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <div className="text-sm text-emerald-700 font-bold">{successMessage}</div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700 font-medium">{error}</div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-primary/40 animate-spin" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                                <Info className="w-8 h-8 text-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-slate-900">No deletions found</p>
                                <p className="text-sm text-slate-400">Records deleted will appear here for 30 days.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{log.display_name || 'Unnamed Record'}</h3>
                                                <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                    ID: {log.record_id}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                    <span>Deleted by: <span className="text-slate-900 font-bold">{log.deleted_by}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                    <span>{new Date(log.deleted_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRestore(log.id)}
                                            disabled={restoringId === log.id}
                                            className="ml-4 flex items-center gap-2 px-4 py-2 bg-white text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            {restoringId === log.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <RefreshCcw className="w-3.5 h-3.5" />
                                            )}
                                            Restore
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
