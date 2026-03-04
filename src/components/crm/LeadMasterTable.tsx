'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Trash2, Edit2, Target, Building2, MapPin, User, FileText, Download, History, Eye } from 'lucide-react'
import LeadForm from './LeadForm'
import LeadProfile360 from './LeadProfile360'
import BulkImportLeadsModal from './BulkImportLeadsModal'
import { deleteLeadAction, updateLeadAction } from '@/app/dashboard/crm/actions'
import { AuditLogsModal } from '../ui/AuditLogsModal'
import SalesPipelineBoard from './SalesPipelineBoard'

interface LeadMasterTableProps {
    leads: any[]
    hideToolbar?: boolean
    externalSearchTerm?: string
    externalViewMode?: 'list' | 'grid'
}

export default function LeadMasterTable({ leads: initialLeads, hideToolbar = false, externalSearchTerm = '', externalViewMode = 'list' }: LeadMasterTableProps) {
    const [leads, setLeads] = useState(initialLeads)

    useEffect(() => {
        setLeads(initialLeads)
    }, [initialLeads])
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLead, setEditingLead] = useState<any>(null)
    const [viewingLead, setViewingLead] = useState<any>(null)

    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
    const [isAuditLogOpen, setIsAuditLogOpen] = useState(false)

    // Use external search term if hideToolbar is true
    const activeSearchTerm = hideToolbar ? externalSearchTerm : searchTerm

    const filteredLeads = leads.filter(lead =>
        lead.project_name?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        lead.developer?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        lead.location?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        lead.sr_no?.toString().includes(activeSearchTerm)
    )

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            const result = await deleteLeadAction(id)
            if (result.success) {
                setLeads(leads.filter(l => l.id !== id))
            } else {
                alert('Failed to delete lead: ' + result.error)
            }
        }
    }

    const handleStageChange = async (leadId: number, newStage: string) => {
        // Optimistic UI update
        const previousLeads = [...leads]
        setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l))

        const fd = new FormData()
        fd.append('stage', newStage)
        const result = await updateLeadAction(leadId, fd)

        if (!result.success) {
            alert('Failed to update lead stage: ' + result.error)
            // Revert
            setLeads(previousLeads)
        }
    }

    const openEdit = (lead: any) => {
        setEditingLead(lead)
        setIsModalOpen(true)
    }

    const openView = (lead: any) => {
        setViewingLead(lead)
    }

    const openCreate = () => {
        setEditingLead(null)
        setIsModalOpen(true)
    }

    const getCategoryClass = (cat: string) => {
        const c = cat?.toLowerCase()
        if (c === 'hot') return 'badge-hot'
        if (c === 'warm') return 'badge-warm'
        return 'badge-cold'
    }

    const getStageClass = (stage: string) => {
        const s = stage?.toLowerCase()
        if (s === 'win') return 'text-green-600 bg-green-50'
        if (s === 'lost') return 'text-red-600 bg-red-50'
        return 'text-blue-600 bg-blue-50'
    }

    return (
        <div className="space-y-6">

            {externalViewMode === 'grid' ? (
                <SalesPipelineBoard
                    leads={filteredLeads}
                    onStageChange={handleStageChange}
                    onLeadClick={openView}
                />
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-3xl">Lead ID</th>
                                    <th className="px-6 py-4">Project</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Project Status</th>
                                    <th className="px-6 py-4 text-center">Sales Stage</th>
                                    <th className="px-6 py-4">Next Action</th>
                                    <th className="px-6 py-4 text-right rounded-tr-3xl"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 hover:border-slate-100 last:border-none">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => openEdit(lead)}>
                                                    {lead.sales_form_no || `SR#${lead.sr_no}`}
                                                </div>
                                                <div className="text-xs font-medium text-slate-400 mt-0.5">
                                                    {lead.sales_form_date || 'No Date'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{lead.project_name || 'Unnamed Project'}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{lead.developer || 'Unknown Developer'}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {lead.location || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {lead.const_status || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md inline-flex items-center justify-center min-w-[80px] ${getStageClass(lead.stage)}`}>
                                                    {lead.stage || 'NEW'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">
                                                    {lead.follow_up || 'TBD'}
                                                </div>
                                                <div className="mt-0.5">
                                                    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${getCategoryClass(lead.category)}`}>
                                                        {lead.category || 'COLD'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); openView(lead); }} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title="360 View">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); openEdit(lead); }} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Target className="w-8 h-8 text-slate-300" />
                                                <p className="font-medium">No leads found. {searchTerm ? 'Try a different search term.' : 'Add your first lead to get started!'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <LeadForm
                    onClose={() => setIsModalOpen(false)}
                    initialData={editingLead}
                />
            )}

            {viewingLead && (
                <LeadProfile360
                    lead={viewingLead}
                    onClose={() => setViewingLead(null)}
                />
            )}

            {isBulkImportOpen && (
                <BulkImportLeadsModal
                    isOpen={isBulkImportOpen}
                    onClose={() => setIsBulkImportOpen(false)}
                />
            )}

            <AuditLogsModal
                isOpen={isAuditLogOpen}
                tableName="leads"
                title="Lead Master"
                onClose={() => setIsAuditLogOpen(false)}
                onRestored={() => window.location.reload()}
            />

            <style jsx>{`
                .badge-hot { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; }
                .badge-warm { background: #ffedd5; color: #f97316; border: 1px solid #fed7aa; }
                .badge-cold { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
            `}</style>
        </div>
    )
}
