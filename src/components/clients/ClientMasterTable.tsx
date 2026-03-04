'use client'

import React, { useState } from 'react'
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    MoreHorizontal,
    Edit2,
    Trash2,
    ExternalLink,
    MapPin,
    Calendar,
    AlertCircle,
    Building2,
    ChevronDown,
    ChevronRight,
    Phone,
    Mail,
    User,
    FileSpreadsheet,
    History,
    FileText,
    Send
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AccessLevel } from '@/utils/supabase/demo-users'
import { BulkImportModal } from './BulkImportModal'
import { AuditLogsModal } from '../ui/AuditLogsModal'

export interface ClientRecord {
    id: string | number
    name: string
    status: string
    category: string
    recent_work?: string
    last_service?: string
    next_service?: string
    last_refilling?: string
    next_refilling?: string
    contract_value: string | number
    area?: string
    address: string
    amc_end_date: string
    priority: 'High' | 'Medium' | 'Low' | string
    // Expanded fields for detail view
    contact_name?: string
    phone?: string
    email?: string
    contact_person?: string
}

interface ClientMasterTableProps {
    title: string
    data: ClientRecord[]
    accessLevel: AccessLevel
    onAdd?: () => void
    onEdit?: (client: ClientRecord) => void
    onDelete?: (id: string | number) => void
    hideToolbar?: boolean
    externalSearchTerm?: string
    externalViewMode?: 'list' | 'grid'
}

export default function ClientMasterTable({
    title,
    data,
    accessLevel,
    onAdd,
    onEdit,
    onDelete,
    hideToolbar = false,
    externalSearchTerm = '',
    externalViewMode = 'list'
}: ClientMasterTableProps) {
    const router = useRouter()
    const [internalViewMode, setInternalViewMode] = useState<'list' | 'grid'>('list')
    const [internalSearchTerm, setInternalSearchTerm] = useState('')
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
    const [isAuditLogOpen, setIsAuditLogOpen] = useState(false)

    const viewMode = hideToolbar ? externalViewMode : internalViewMode
    const searchTerm = hideToolbar ? externalSearchTerm : internalSearchTerm
    const setViewMode = setInternalViewMode

    const toggleRow = (id: string | number, e: React.MouseEvent) => {
        e.stopPropagation()
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedRows(newExpanded)
    }

    const filteredData = data.filter(client =>
        (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.address || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-600 border-red-200'
            case 'medium': return 'bg-amber-100 text-amber-600 border-amber-200'
            case 'low': return 'bg-emerald-100 text-emerald-600 border-emerald-200'
            default: return 'bg-slate-100 text-slate-600 border-slate-200'
        }
    }

    const getStatusColor = (status: string) => {
        return status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
    }

    const renderMissing = (label: string, client: ClientRecord) => (
        <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(client) }}
            className="inline-flex items-center gap-1 text-[9px] text-primary/80 bg-primary/10 hover:bg-primary hover:text-white px-2 py-0.5 rounded uppercase tracking-widest font-bold transition-all"
        >
            <Plus className="w-2.5 h-2.5" /> Add {label}
        </button>
    )

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            {/* Top Bar removed for CRM Page integration */}

            <BulkImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                onSuccess={(count) => {
                    console.log(`Successfully imported ${count} clients`)
                }}
            />
            <AuditLogsModal
                isOpen={isAuditLogOpen}
                tableName="clients"
                title="Client Master"
                onClose={() => setIsAuditLogOpen(false)}
                onRestored={() => window.location.reload()}
            />

            {/* List View */}
            {viewMode === 'list' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                                    <th className="w-10 px-4 py-4"></th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contract</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-inter">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No records found matching your search.</td>
                                    </tr>
                                ) : (
                                    filteredData.map((client) => (
                                        <React.Fragment key={client.id}>
                                            <tr
                                                className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${expandedRows.has(client.id) ? 'bg-slate-50/50' : ''}`}
                                                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                            >
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={(e) => toggleRow(client.id, e)}
                                                        className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                                                    >
                                                        {expandedRows.has(client.id) ? (
                                                            <ChevronDown className="w-4 h-4 text-primary" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getStatusColor(client.status)}`} />
                                                        <div className="space-y-1">
                                                            <div className="text-[13px] text-slate-900 font-bold group-hover:text-primary transition-colors leading-tight">{client.name}</div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="inline-block w-fit px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">
                                                                    {client.category || 'Residential'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <div className="text-[12px] text-slate-900 font-bold flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-primary/70" /> {client.area}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 italic truncate max-w-[150px]" title={client.address}>
                                                            {client.address || '—'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-slate-900">₹{client.contract_value?.toLocaleString() || '0'}</div>
                                                        <div className="text-[10px] text-slate-400">Ends: {client.amc_end_date || 'N/A'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getPriorityColor(client.priority)}`}>
                                                        {client.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onEdit?.(client) }}
                                                            className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-all"
                                                            title="Edit Client"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); alert('Generating Thank You Letter for ' + client.name) }}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 transition-all"
                                                            title="Send Thank You Letter"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDelete?.(client.id) }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                                            title="Delete Client"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows.has(client.id) && (
                                                <tr className="bg-slate-50/30 animate-in slide-in-from-top-2 duration-300">
                                                    <td className="px-4 py-0"></td>
                                                    <td colSpan={7} className="px-6 py-6 border-l-4 border-primary">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                            <div className="space-y-3">
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><User className="w-3.5 h-3.5" /> Contact Profile</h4>
                                                                <div className="space-y-2">
                                                                    <div className="text-sm font-bold text-slate-700 flex items-center gap-2">{client.contact_name || renderMissing('Name', client)}</div>
                                                                    <div className="text-xs text-slate-500 italic mt-0.5">{client.contact_person || renderMissing('Role', client)}</div>
                                                                    <div className="flex flex-col gap-1.5 pt-1.5">
                                                                        <div className="flex items-center gap-2 text-xs text-slate-600"><Phone className="w-3 h-3 text-slate-400" /> {client.phone || renderMissing('Phone', client)}</div>
                                                                        <div className="flex items-center gap-2 text-xs text-slate-600"><Mail className="w-3 h-3 text-slate-400" /> {client.email || renderMissing('Email', client)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Calendar className="w-3.5 h-3.5" /> Quick Timeline</h4>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm leading-none flex flex-col justify-center gap-1.5 min-h[60px]">
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight m-0">AMC End</p>
                                                                        <div className="text-xs font-bold text-primary m-0">{client.amc_end_date || renderMissing('Date', client)}</div>
                                                                    </div>
                                                                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Status</p>
                                                                        <p className="text-xs font-bold text-slate-700">{client.status}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-end">
                                                                <button
                                                                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                                                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 bg-white px-4 py-2 rounded-xl border border-primary/20 hover:border-primary transition-all shadow-sm"
                                                                >
                                                                    Open Full 360 View <ExternalLink className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid (Card) View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-primary/30 p-6 space-y-4 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(client.status)}`} />
                                        <h3 className="text-[13px] font-bold text-slate-900 group-hover:text-primary transition-colors">{client.name}</h3>
                                    </div>
                                    <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tight italic">
                                        {client.category || 'Residential'}
                                    </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getPriorityColor(client.priority)}`}>
                                    {client.priority}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                                <div className="space-y-1">
                                    <p className="text-slate-400 font-medium">Contract Value</p>
                                    <p className="text-slate-900 font-bold">₹{client.contract_value?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 font-medium">AMC End</p>
                                    <p className="text-slate-900 font-bold underline decoration-primary/20 decoration-2">{client.amc_end_date || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 text-xs bg-slate-50 p-3 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                    <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                                    <span>{client.area || 'N/A'}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 pl-5 italic truncate">
                                    {client.address}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {client.name.charAt(0)}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium italic">Click for details</span>
                                </div>
                                <div className="flex items-center gap-1 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary font-bold text-xs">
                                    View 360  <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
