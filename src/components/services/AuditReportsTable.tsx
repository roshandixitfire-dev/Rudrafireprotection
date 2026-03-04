'use client'

import { useState } from 'react'
import { Search, Plus, Trash2, Calendar, User, FileText, Download } from 'lucide-react'

interface AuditReport {
    id: string
    client_id: number
    client_name: string
    report_date: string
    auditor_name: string
    report_type: string
    status: string
    findings: string
    recommendations: string
}

export default function AuditReportsTable({
    initialData,
    accessLevel,
    onAdd,
    onBulkImport
}: {
    initialData: any[],
    accessLevel: string,
    onAdd: () => void,
    onBulkImport: () => void
}) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredData = initialData.filter((r: any) =>
        (r.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.auditor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.report_type || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusDisplay = (status: string) => {
        let dotColor = 'bg-slate-300'
        switch (status?.toLowerCase()) {
            case 'draft': dotColor = 'bg-slate-400'; break
            case 'completed': dotColor = 'bg-emerald-500'; break
            case 'needs review': dotColor = 'bg-amber-500'; break
            case 'rejected': dotColor = 'bg-red-500'; break
        }

        return (
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                <span className="font-semibold text-slate-700">{status || 'Draft'}</span>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="flex flex-col bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Digital Audit Reports</h1>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 ml-1 hidden md:inline-block">
                        {filteredData.length}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search clients, auditors, or types..."
                            className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {(accessLevel === 'full' || accessLevel === 'admin' || accessLevel === 'employee') && (
                        <>
                            <button
                                onClick={onBulkImport}
                                className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 px-6 h-11 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
                            >
                                <Download className="w-4 h-4 text-emerald-600" />
                                <span>Bulk Import</span>
                            </button>
                            <button
                                onClick={onAdd}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-11 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 shadow-indigo-600/20"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Report</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Flat Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left align-middle text-slate-700 border-collapse">
                        <thead className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-5 font-bold">Date</th>
                                <th className="px-6 py-5 font-bold">Client / Society</th>
                                <th className="px-6 py-5 font-bold">Auditor</th>
                                <th className="px-6 py-5 font-bold">Report Type</th>
                                <th className="px-6 py-5 font-bold">Status</th>
                                <th className="px-6 py-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="w-8 h-8 text-slate-300" />
                                            <p className="font-medium">No audit reports found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((record: any) => (
                                    <tr
                                        key={record.id}
                                        className="hover:bg-slate-50 border-t border-slate-100/60 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-900 font-bold group-hover:text-indigo-600 transition-colors">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {record.report_date ? new Date(record.report_date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            {record.client_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                {record.auditor_name || 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {record.report_type || 'Standard Audit'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusDisplay(record.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => alert(`View details for ${record.id} coming soon`)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                                    title="View Full Report"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => alert('Delete coming soon')}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
