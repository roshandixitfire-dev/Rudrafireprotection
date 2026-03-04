'use client'

import { useState } from 'react'
import { MoreHorizontal, Calendar, MapPin, Building2, User, Phone, Mail, Clock, DollarSign, Filter, RefreshCcw, Plus, Eye } from 'lucide-react'

interface Lead {
    id: number
    company_name: string
    project_name: string
    developer: string
    location: string
    stage: string
    category: string
    follow_up: string
    contact_person: string
    contact_number: string
    email_id: string
    expected_value?: number
}

interface SalesPipelineBoardProps {
    leads: Lead[]
    onStageChange: (leadId: number, newStage: string) => void
    onLeadClick: (lead: Lead) => void
}

const STAGES = [
    { id: 'NEW', label: 'New Lead', color: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600' },
    { id: 'CONTACTED', label: 'Contacted', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { id: 'QUOTED', label: 'Quoted', color: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    { id: 'WIN', label: 'Won', color: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    { id: 'LOST', label: 'Lost', color: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
]

export default function SalesPipelineBoard({ leads, onStageChange, onLeadClick }: SalesPipelineBoardProps) {
    const [draggedLead, setDraggedLead] = useState<number | null>(null)
    const [isUpdating, setIsUpdating] = useState(false);

    const handleDragStart = (e: React.DragEvent, leadId: number) => {
        setDraggedLead(leadId)
        e.dataTransfer.effectAllowed = 'move'
        // Add a class for styling while dragging
        e.currentTarget.classList.add('opacity-50')
    }

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedLead(null)
        e.currentTarget.classList.remove('opacity-50')
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e: React.DragEvent, newStage: string) => {
        e.preventDefault()
        if (draggedLead && !isUpdating) {
            const lead = leads.find(l => l.id === draggedLead)
            if (lead && lead.stage !== newStage) {
                setIsUpdating(true)
                try {
                    await onStageChange(draggedLead, newStage)
                } finally {
                    setIsUpdating(false)
                }
            }
        }
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x hide-scrollbar h-[calc(100vh-280px)] min-h-[500px]">
            {STAGES.map(stage => {
                const stageLeads = leads.filter(l => (l.stage || 'NEW').toUpperCase() === stage.id)
                const totalValue = stageLeads.reduce((sum, lead) => sum + (Number(lead.expected_value) || 0), 0)

                return (
                    <div
                        key={stage.id}
                        className={`flex-shrink-0 w-[320px] rounded-2xl flex flex-col snap-center transition-all ${stage.color} border ${stage.border}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        {/* Column Header */}
                        <div className="p-4 border-b border-black/5 flex justify-between items-center mb-2">
                            <div>
                                <h3 className={`font-bold text-sm tracking-wide ${stage.text}`}>
                                    {stage.label}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/60 px-2 py-0.5 rounded-full">
                                        {stageLeads.length} Deals
                                    </span>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center transition-colors text-slate-400 hover:text-slate-700">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Cards Container */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
                            {stageLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onLeadClick(lead)}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/20 transition-all group relative"
                                >
                                    {/* Action menu triggers */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onLeadClick(lead); }}
                                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all z-10"
                                        title="360 View"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>

                                    <div className="pr-6">
                                        <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-primary transition-colors">
                                            {lead.project_name || 'Unnamed Project'}
                                        </div>
                                        {lead.company_name && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                                <Building2 className="w-3 h-3 text-slate-400" />
                                                <span className="truncate">{lead.company_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags/Badges */}
                                    <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full 
                                            ${lead.category === 'HOT' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                lead.category === 'WARM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                            {lead.category || 'COLD'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-50">
                                        {lead.contact_person && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate font-medium">{lead.contact_person}</span>
                                            </div>
                                        )}
                                        {lead.follow_up && (
                                            <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/50">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="font-semibold">Next: {new Date(lead.follow_up).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}
                            {stageLeads.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-slate-200/50 rounded-xl flex items-center justify-center p-4">
                                    <p className="text-xs font-semibold text-slate-400 text-center">Drop deals here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
