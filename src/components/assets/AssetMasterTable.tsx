'use client'

import React, { useState } from 'react'
import { Plus, Search, QrCode, History, Edit2, Trash2 } from 'lucide-react'

interface AssetMasterTableProps {
    data: any[]
    onAdd: () => void
    onScan: () => void
    onViewAuditLogs: () => void
    onViewHistory: (asset: any) => void
    onLogService: (asset: any) => void
    onEdit: (asset: any) => void
    onDelete: (id: number) => void
}

export default function AssetMasterTable({
    data,
    onAdd,
    onScan,
    onViewAuditLogs,
    onViewHistory,
    onLogService,
    onEdit,
    onDelete,
}: AssetMasterTableProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredData = data.filter((item) => {
        const query = searchQuery.toLowerCase()
        return (
            item.manual_asset_tag?.toLowerCase().includes(query) ||
            item.exact_location?.toLowerCase().includes(query) ||
            item.equipment_master?.category?.toLowerCase().includes(query) ||
            item.clients?.name?.toLowerCase().includes(query)
        )
    })

    const getConditionBadge = (condition: string) => {
        switch (condition) {
            case 'Excellent': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">Excellent</span>
            case 'Good': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Good</span>
            case 'Fair': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">Fair</span>
            case 'Poor': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-bold">Poor</span>
            case 'Condemned': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">Condemned</span>
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">{condition}</span>
        }
    }

    return (
        <div className="bg-white border text-black border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex flex-col bg-white p-4 md:p-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Client Assets</h2>
                    <p className="text-slate-500 text-sm ml-2 hidden md:block">Manage and track physical safety equipment</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <button
                        onClick={onAdd}
                        className="flex items-center justify-center gap-2 px-5 h-11 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95 shadow-red-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Asset</span>
                    </button>

                    <button
                        onClick={onScan}
                        className="flex items-center justify-center gap-2 px-4 h-11 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-sm active:scale-95 shadow-slate-800/20"
                    >
                        <QrCode className="w-4 h-4" />
                        <span>Scan QR</span>
                    </button>

                    <button
                        onClick={onViewAuditLogs}
                        className="flex items-center justify-center w-11 h-11 bg-slate-50 text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-indigo-500 transition-all active:scale-95 shadow-sm"
                        title="Data Audit Logs"
                    >
                        <History className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-3xl">Asset Tag</th>
                            <th className="px-6 py-4">Client Site</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Next Due Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right rounded-tr-3xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                                    No assets found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((asset) => {
                                // Determine next due date and if it's expired
                                const nextDueDateStr = asset.next_service_due || asset.next_due_date
                                const nextDueDate = nextDueDateStr ? new Date(nextDueDateStr) : null
                                const isExpired = nextDueDate && nextDueDate < new Date()

                                return (
                                    <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {asset.manual_asset_tag || <span className="text-slate-400 font-normal italic">QR Only</span>}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {asset.clients?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{asset.equipment_master?.category}</div>
                                            <div className="text-xs text-slate-500">{asset.equipment_master?.make_model}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={asset.exact_location}>
                                            {asset.exact_location}
                                        </td>
                                        <td className={`px-6 py-4 font-semibold ${isExpired ? 'text-red-600' : 'text-slate-600'}`}>
                                            {nextDueDate ? (() => {
                                                const d = new Date(nextDueDate);
                                                return isNaN(d.getTime()) ? 'N/A' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                            })() : 'Not Set'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getConditionBadge(asset.current_condition)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onLogService(asset)}
                                                className="text-primary hover:text-primary/80 font-bold tracking-wide text-xs px-2 py-1 rounded hover:bg-primary/5 transition-colors mr-2"
                                            >
                                                LOG SERVICE
                                            </button>
                                            <button
                                                onClick={() => onViewHistory(asset)}
                                                className="text-slate-500 hover:text-slate-800 font-bold tracking-wide text-xs px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                                            >
                                                HISTORY
                                            </button>
                                            <div className="inline-flex items-center ml-2 border-l border-slate-200 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(asset)}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all mx-0.5"
                                                    title="Edit Asset"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(asset.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mx-0.5"
                                                    title="Delete Asset"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
