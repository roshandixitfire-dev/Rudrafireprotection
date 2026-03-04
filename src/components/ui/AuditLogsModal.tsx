'use client'

import React, { useState, useEffect } from 'react'
import {
    X,
    Trash2,
    Edit3,
    RefreshCcw,
    Calendar,
    User,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Copy,
    ArrowRight
} from 'lucide-react'
import { getAuditLogsAction, restoreDeletedRecordAction } from '@/app/dashboard/audit_logs/actions'

interface AuditLogsModalProps {
    isOpen: boolean
    tableName: string
    title: string
    onClose: () => void
    onRestored?: () => void
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({
    isOpen,
    tableName,
    title,
    onClose,
    onRestored
}) => {
    const [activeTab, setActiveTab] = useState<'edits' | 'deletions'>('edits')

    const [edits, setEdits] = useState<any[]>([])
    const [deletions, setDeletions] = useState<any[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRestoring, setIsRestoring] = useState<number | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const fetchLogs = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getAuditLogsAction(tableName)
            if (result.success) {
                setEdits(result.edits || [])
                setDeletions(result.deletions || [])
            } else {
                setError(result.error || 'Failed to fetch audit logs')
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
            setActiveTab('edits') // Reset to default
        }
    }, [isOpen, tableName])

    const handleRestore = async (logId: number) => {
        setIsRestoring(logId)
        setError(null)
        try {
            const result = await restoreDeletedRecordAction(tableName, logId)
            if (result.success) {
                setSuccessMessage('Record restored successfully!')
                fetchLogs() // Refresh lists
                if (onRestored) onRestored()
                setTimeout(() => setSuccessMessage(null), 3000)
            } else {
                setError(result.error || 'Failed to restore record')
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during restoration')
        } finally {
            setIsRestoring(null)
        }
    }

    const formatValue = (val: any) => {
        if (val === null || val === undefined) return <span className="text-slate-400 italic">Empty</span>
        if (typeof val === 'object') return JSON.stringify(val)
        return String(val)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                            <HistoryIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-none">Data Audit Log</h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{title} History Tracking</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-slate-200 bg-slate-50">
                    <button
                        onClick={() => setActiveTab('edits')}
                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'edits' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit History
                        <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{edits.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('deletions')}
                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'deletions' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Deletion Graveyard
                        <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{deletions.length}</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <p className="text-emerald-700 font-bold text-sm">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 font-bold text-sm">{error}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Audit Trail...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* EDITS TAB */}
                            {activeTab === 'edits' && (
                                <>
                                    {edits.length === 0 ? (
                                        <EmptyState icon={<Edit3 />} message="No edit history found for this module." />
                                    ) : (
                                        edits.map((log) => (
                                            <div key={log.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
                                                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{log.display_name || `Record ID: ${log.record_id}`}</h3>
                                                        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                                                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                                                                <User className="w-3.5 h-3.5 text-blue-500" />
                                                                {log.edited_by || 'Unknown User'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                {new Date(log.edited_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Fields Changed</div>
                                                    <div className="grid gap-3">
                                                        {Object.keys(log.new_data || {}).map(fieldKey => (
                                                            <div key={fieldKey} className="flex flex-col md:flex-row md:items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                                                <div className="w-48 flex-shrink-0">
                                                                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-md border border-slate-300">
                                                                        {fieldKey}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 flex flex-col md:flex-row items-center gap-3 text-sm">
                                                                    <div className="flex-1 p-2 bg-red-50/50 text-red-600 rounded-lg border border-red-100/50 break-words line-through decoration-red-300">
                                                                        {formatValue(log.old_data?.[fieldKey])}
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 hidden md:block" />
                                                                    <div className="flex-1 p-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-200 shadow-sm break-words relative w-full">
                                                                        {formatValue(log.new_data?.[fieldKey])}
                                                                        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-sm uppercase">New</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}


                            {/* DELETIONS TAB */}
                            {activeTab === 'deletions' && (
                                <>
                                    {deletions.length === 0 ? (
                                        <EmptyState icon={<Trash2 />} message="No deleted records found in the graveyard." />
                                    ) : (
                                        deletions.map((log) => (
                                            <div key={log.id} className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm hover:border-red-200 transition-colors">
                                                <div className="px-6 py-4 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-200">Deleted Record</span>
                                                            <h3 className="font-bold text-slate-900">{log.display_name || `Record ID: ${log.record_id}`}</h3>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                                                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                                                                <User className="w-3.5 h-3.5 text-red-500" />
                                                                {log.deleted_by || 'Unknown'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                {new Date(log.deleted_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to restore this record? It will be re-inserted into the active system.')) {
                                                                handleRestore(log.id)
                                                            }
                                                        }}
                                                        disabled={isRestoring === log.id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-bold text-sm shadow-sm active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isRestoring === log.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 text-emerald-500" />}
                                                        Restore Record
                                                    </button>
                                                </div>
                                                <div className="p-6">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Archived Payload</div>
                                                    <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto relative group">
                                                        <pre>{JSON.stringify(log.data, null, 2)}</pre>
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(JSON.stringify(log.data, null, 2))}
                                                            className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Copy JSON Payload"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-inner text-slate-300 [&>svg]:w-8 [&>svg]:h-8">
                {icon}
            </div>
            <p className="font-bold text-slate-500">{message}</p>
        </div>
    )
}

function HistoryIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
