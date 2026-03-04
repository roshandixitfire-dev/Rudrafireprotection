'use client'

import { useState } from 'react'
import { Search, Plus, Trash2, Calendar, User, Wrench } from 'lucide-react'

interface ServiceRecord {
    id: number
    service_id: string
    client: string
    type: string
    date: string
    technician: string
    status: string
}

export default function ServiceRecordsTable({ initialData, accessLevel }: { initialData: any[], accessLevel: string }) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredData = initialData.filter((s: any) =>
        (s.service_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusDisplay = (status: string) => {
        let dotColor = 'bg-slate-300'
        switch (status?.toLowerCase()) {
            case 'scheduled': dotColor = 'bg-blue-500'; break
            case 'in progress': dotColor = 'bg-amber-500'; break
            case 'completed': dotColor = 'bg-emerald-500'; break
            case 'delayed': dotColor = 'bg-red-500'; break
        }

        return (
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                <span className="font-semibold text-slate-700">{status || 'Unknown'}</span>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="flex flex-col bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Service Records</h1>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 ml-1 hidden md:inline-block">
                        {filteredData.length}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search records, clients or types..."
                            className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {(accessLevel === 'full' || accessLevel === 'admin' || accessLevel === 'employee') && (
                        <button
                            onClick={() => alert('New Service Form coming soon')}
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 h-11 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 shadow-red-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Log Service</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Flat Table (No vertical/horizontal strong borders) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left align-middle text-slate-700 border-collapse">
                        <thead className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-5 font-bold">Service ID</th>
                                <th className="px-6 py-5 font-bold">Client & Site</th>
                                <th className="px-6 py-5 font-bold">Service Type</th>
                                <th className="px-6 py-5 font-bold">Scheduled Date</th>
                                <th className="px-6 py-5 font-bold">Technician Name</th>
                                <th className="px-6 py-5 font-bold">Status</th>
                                <th className="px-6 py-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Wrench className="w-8 h-8 text-slate-300" />
                                            <p className="font-medium">No service records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((record: any) => (
                                    <tr
                                        key={record.id}
                                        className="hover:bg-slate-50 border-t border-slate-100/60 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-primary transition-colors">
                                            {record.service_id || record.serviceId}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {record.client}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {record.type}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {record.date ? (() => {
                                                    const d = new Date(record.date);
                                                    return isNaN(d.getTime()) ? 'N/A' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                                })() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                {record.technician || 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusDisplay(record.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => alert('Delete coming soon')}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Delete Record"
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
