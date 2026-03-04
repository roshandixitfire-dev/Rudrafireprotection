'use client'

import { useState } from 'react'
import { Plus, Search, FileText, FileDown, Eye, CheckCircle2, Clock } from 'lucide-react'
import QuotationForm from './QuotationForm'

export default function QuotationsMasterTable({ initialQuotations, clients, accessLevel }: any) {
    const [quotations, setQuotations] = useState(initialQuotations)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingQuotation, setEditingQuotation] = useState<any>(null)

    const handleSuccess = (newQuote: any, isEdit: boolean) => {
        if (isEdit) {
            setQuotations((prev: any) => prev.map((q: any) => q.id === newQuote.id ? newQuote : q))
        } else {
            setQuotations((prev: any) => [newQuote, ...prev])
        }
    }

    const filteredData = quotations.filter((q: any) =>
        (q.quotation_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.clients?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'draft': return 'bg-slate-100 text-slate-600 border border-slate-200'
            case 'sent': return 'bg-blue-50 text-blue-600 border border-blue-100'
            case 'accepted': return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            case 'rejected': return 'bg-red-50 text-red-600 border border-red-100'
            case 'expired': return 'bg-amber-50 text-amber-600 border border-amber-100'
            default: return 'bg-slate-100 text-slate-600 border border-slate-200'
        }
    }

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            {/* Top Bar with Breadcrumbs */}
            <div className="flex flex-col bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block">Dashboard / Sales</span>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-none">Quotations</h1>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 hidden md:inline-block">
                                {filteredData.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search quotes or clients..."
                            className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {(accessLevel === 'full' || accessLevel === 'admin' || accessLevel === 'employee') && (
                        <button
                            onClick={() => {
                                setEditingQuotation(null)
                                setIsFormOpen(true)
                            }}
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 h-11 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 shadow-red-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Quotation</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left align-middle text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-2xl w-32">Quote Number</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Created Date</th>
                                <th className="px-6 py-4">Valid Until</th>
                                <th className="px-6 py-4 text-right">Quote Value (₹)</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 text-slate-300" />
                                            <p>No quotations found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((quote: any) => {
                                    // Calculate Valid Until (e.g., 30 days from creation)
                                    const createdDate = new Date(quote.quotation_date)
                                    const validUntilDate = new Date(createdDate)
                                    validUntilDate.setDate(validUntilDate.getDate() + 30)

                                    // Make Valid Until red if it has passed and status is still Draft/Sent
                                    const today = new Date()
                                    const isExpired = validUntilDate < today && !['Accepted', 'Rejected'].includes(quote.status)

                                    return (
                                        <tr
                                            key={quote.id}
                                            className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50 last:border-none"
                                        >
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {quote.quotation_number}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {quote.clients?.name || 'Unknown Client'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {(() => {
                                                    const d = new Date(createdDate);
                                                    return isNaN(d.getTime()) ? 'N/A' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                                })()}
                                            </td>
                                            <td className={`px-6 py-4 font-medium ${isExpired ? 'text-red-600' : 'text-slate-500'}`}>
                                                {(() => {
                                                    const d = new Date(validUntilDate);
                                                    return isNaN(d.getTime()) ? 'N/A' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-700 text-right">
                                                {quote.grand_total?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg inline-flex items-center justify-center min-w-[80px] ${getStatusColor(quote.status)}`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingQuotation(quote)
                                                            setIsFormOpen(true)
                                                        }}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                        title="View / Edit"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => alert('PDF generation coming soon')}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                        title="Download PDF"
                                                    >
                                                        <FileDown className="w-4 h-4" />
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

            {/* Odoo Style Form */}
            {isFormOpen && (
                <QuotationForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    initialData={editingQuotation}
                    clients={clients}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    )
}
