'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
    Plus, Search, FileText, FileDown, Eye, Pencil, Trash2,
    LayoutGrid, List, Filter, TrendingUp, Receipt,
    ClipboardList, IndianRupee, ChevronDown, X, AlertTriangle, Tag, CreditCard, Calculator
} from 'lucide-react'
import { deleteQuotation, deleteInvoice, updateQuotationStatus, payInvoice } from '@/app/dashboard/sales/actions'
import { TagQuoteModal } from './TagQuoteModal'
import { PayInvoiceModal } from './PayInvoiceModal'
import { SalesBulkImportModal } from './SalesBulkImportModal'
import CostingModule from './CostingModule'

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
type RecordType = 'professional' | 'legacy' | 'invoice' | 'amc'
type ViewMode = 'table' | 'card'

interface SalesRecord {
    id: string
    recordType: RecordType
    number: string
    client: string
    date: string
    validUntil?: string
    value: number
    status: string
    raw: any
}

interface SalesHubProps {
    quotations: any[]
    invoices: any[]
    clients: any[]
    accessLevel: string
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'N/A'
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

function formatCurrency(val: number | null | undefined) {
    if (val == null || isNaN(val)) return '—'
    return '₹' + val.toLocaleString('en-IN')
}

function getStatusStyle(status: string) {
    switch (status?.toLowerCase()) {
        case 'draft': return 'bg-slate-100 text-slate-600 border border-slate-200'
        case 'sent': return 'bg-blue-50 text-blue-600 border border-blue-100'
        case 'accepted': return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        case 'paid': return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        case 'rejected': return 'bg-red-50 text-red-600 border border-red-100'
        case 'expired': return 'bg-amber-50 text-amber-600 border border-amber-100'
        case 'overdue': return 'bg-red-50 text-red-600 border border-red-100'
        case 'unpaid': return 'bg-amber-50 text-amber-700 border border-amber-100'
        default: return 'bg-slate-100 text-slate-600 border border-slate-200'
    }
}

function getTypeBadge(type: RecordType) {
    switch (type) {
        case 'professional':
            return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-violet-50 text-violet-600 border border-violet-100">Professional</span>
        case 'legacy':
            return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100">Legacy</span>
        case 'invoice':
            return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-orange-50 text-orange-600 border border-orange-100">Invoice</span>
        case 'amc':
            return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100">AMC</span>
    }
}

// ─────────────────────────────────────────────────────────────────
// Dashboard Stat Card
// ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: any; label: string; value: string | number; sub?: string; color: string
}) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────
// Delete Confirm Dialog
// ─────────────────────────────────────────────────────────────────
function DeleteDialog({ record, onCancel, onConfirm, isPending }: {
    record: SalesRecord; onCancel: () => void; onConfirm: () => void; isPending: boolean
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Delete Record</h3>
                        <p className="text-xs text-slate-400">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-5">
                    Are you sure you want to delete <span className="font-bold text-slate-900">{record.number}</span>?
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
                    >
                        {isPending ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
export default function SalesHub({ quotations, invoices, clients, accessLevel }: SalesHubProps) {
    const canWrite = accessLevel === 'admin' || accessLevel === 'full' || accessLevel === 'employee'

    // Table state
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'quotes' | 'invoices' | 'costing'>('all')
    const [mainTab, setMainTab] = useState<'hub' | 'costing'>('hub')
    const [statusFilter, setStatusFilter] = useState('')
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [deleteTarget, setDeleteTarget] = useState<SalesRecord | null>(null)
    const [allRecords, setAllRecords] = useState<{ quotations: any[]; invoices: any[] }>({
        quotations, invoices
    })

    const [activeDropdown, setActiveDropdown] = useState<'quote' | 'invoice' | null>(null)
    const [tagModalOpen, setTagModalOpen] = useState(false)
    const [selectedQuote, setSelectedQuote] = useState<SalesRecord | null>(null)
    
    const [payModalOpen, setPayModalOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<SalesRecord | null>(null)
    
    const [importModalOpen, setImportModalOpen] = useState(false)

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (!document.getElementById('sales-header-actions')?.contains(e.target as Node)) {
                setActiveDropdown(null)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    const [isPending, startTransition] = useTransition()

    // ── Normalise all records into one list ──────────────────────
    const records: SalesRecord[] = useMemo(() => {
        const quoteRecords: SalesRecord[] = allRecords.quotations.map(q => {
            const isPro = q.type === 'professional'
            const isAmc = q.type === 'amc'
            const isLegacy = q.type === 'legacy'

            const validUntil = q.expiration_date || (() => {
                const dateVal = q.quotation_date || q.quote_date || new Date().toISOString()
                const d = new Date(dateVal)
                d.setDate(d.getDate() + 30)
                return d.toISOString()
            })()

            let recordType: RecordType = 'legacy'
            if (isPro) recordType = 'professional'
            else if (isAmc) recordType = 'amc'

            return {
                id: String(q.id),
                recordType,
                number: q.quotation_number || q.quote_no || '—',
                client: q.clients?.name || q.company_name || q.raw_json?.companyName || q.client_name || 'Unknown',
                date: q.quotation_date || q.quote_date,
                validUntil,
                value: q.grand_total ?? 0,
                status: q.status || 'Draft',
                raw: q
            }
        })

        const invoiceRecords: SalesRecord[] = allRecords.invoices.map(i => ({
            id: String(i.id),
            recordType: 'invoice' as RecordType,
            // legacy_invoices uses invoice_no; old invoices table uses invoice_no or invoice_number
            number: i.invoice_no || i.invoice_number || '—',
            client: i.clients?.name || i.company_name || i.client_name || 'Unknown',
            date: i.invoice_date || i.issue_date,
            validUntil: i.due_date,
            value: i.grand_total ?? i.amount ?? 0,
            status: i.status || 'Draft',
            raw: i
        }))

        return [...quoteRecords, ...invoiceRecords].sort((a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        )
    }, [allRecords, clients])

    // ── Dashboard stats ──────────────────────────────────────────
    const quoteCount = allRecords.quotations.length
    const invoiceCount = allRecords.invoices.length
    const quoteValue = allRecords.quotations.reduce((s, q) => s + (q.grand_total || 0), 0)
    const invoiceValue = allRecords.invoices.reduce((s, i) => s + (i.amount || i.grand_total || 0), 0)

    // ── Filtering ────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return records.filter(r => {
            if (typeFilter === 'quotes' && r.recordType === 'invoice') return false
            if (typeFilter === 'invoices' && r.recordType !== 'invoice') return false
            if (statusFilter && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false
            const term = searchTerm.toLowerCase()
            if (term && !r.number.toLowerCase().includes(term) && !r.client.toLowerCase().includes(term)) return false
            return true
        })
    }, [records, typeFilter, statusFilter, searchTerm])

    // ── Actions ──────────────────────────────────────────────────
    const handleEdit = (r: SalesRecord) => {
        if (r.recordType === 'invoice') {
            window.location.href = `/dashboard/invoices/legacy`
        } else if (r.recordType === 'professional') {
            window.location.href = `/dashboard/quotations/new?id=${r.id}`
        } else if (r.recordType === 'amc') {
            window.location.href = `/dashboard/quotations/legacy?tab=amc&id=${r.id}`
        } else {
            window.location.href = `/dashboard/quotations/legacy?id=${r.id}`
        }
    }

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return
        startTransition(async () => {
            if (deleteTarget.recordType === 'invoice') {
                await deleteInvoice(deleteTarget.id)
                setAllRecords(prev => ({ ...prev, invoices: prev.invoices.filter(i => String(i.id) !== deleteTarget.id) }))
            } else {
                await deleteQuotation(deleteTarget.id)
                setAllRecords(prev => ({ ...prev, quotations: prev.quotations.filter(q => String(q.id) !== deleteTarget.id) }))
            }
            setDeleteTarget(null)
        })
    }

    const handleTagSuccess = async (newStatus: string) => {
        if (!selectedQuote) return
        startTransition(async () => {
            const res = await updateQuotationStatus(selectedQuote.id, newStatus)
            if (res.success) {
                setAllRecords(prev => ({
                    ...prev,
                    quotations: prev.quotations.map(q => String(q.id) === selectedQuote.id ? { ...q, status: newStatus } : q)
                }))
            }
            setTagModalOpen(false)
            setSelectedQuote(null)
        })
    }

    const handleDirectStatusChange = (record: SalesRecord, newStatus: string) => {
        setAllRecords(prev => ({
            quotations: prev.quotations.map(q => String(q.id) === record.id ? { ...q, status: newStatus } : q),
            invoices: prev.invoices.map(i => String(i.id) === record.id ? { ...i, status: newStatus } : i)
        }))
        startTransition(async () => {
            await updateQuotationStatus(record.id, newStatus)
        })
    }

    const handlePaySuccess = async (paymentData: any) => {
        if (!selectedInvoice) return
        startTransition(async () => {
            const res = await payInvoice(selectedInvoice.id, paymentData)
            if (res.success) {
                setAllRecords(prev => ({
                    ...prev,
                    invoices: prev.invoices.map(i => String(i.id) === selectedInvoice.id ? { ...i, status: 'Paid', payment_details: paymentData } : i)
                }))
            }
            setPayModalOpen(false)
            setSelectedInvoice(null)
        })
    }

    // ── All unique statuses for filter dropdown ──────────────────
    const allStatuses = useMemo(() =>
        Array.from(new Set(records.map(r => r.status))).filter(Boolean),
        [records]
    )

    // ── Date-based expiry check ──────────────────────────────────
    const today = new Date()
    const isExpired = (r: SalesRecord) =>
        r.validUntil && new Date(r.validUntil) < today && !['accepted', 'paid', 'rejected'].includes(r.status.toLowerCase())

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">

            {/* ── Page Header ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block">Dashboard / Sales</span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Sales</h1>
                    </div>
                </div>
                {canWrite && (
                    <div id="sales-header-actions" className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setMainTab(mainTab === 'costing' ? 'hub' : 'costing')}
                            className={`flex items-center gap-2 px-4 h-11 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
                                mainTab === 'costing'
                                    ? 'bg-violet-600 text-white shadow-violet-600/20'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Calculator className="w-4 h-4 text-violet-500" />
                            Costing Estimator
                        </button>
                        <Link
                            href="/dashboard/quotations/legacy"
                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 h-11 rounded-xl font-bold text-sm transition-all shadow-sm shadow-violet-600/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Quote
                        </Link>
                        <Link
                            href="/dashboard/invoices/legacy?type=tax"
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 h-11 rounded-xl font-bold text-sm transition-all shadow-sm shadow-orange-500/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Invoice
                        </Link>
                    </div>
                )}
            </div>

            {mainTab === 'costing' ? (
                <CostingModule clients={clients} onBackToSales={() => setMainTab('hub')} />
            ) : (
                <>

            {/* ── Dashboard Cards ───────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={ClipboardList}
                    label="Total Quotes"
                    value={quoteCount}
                    sub="All quote types"
                    color="bg-violet-50 text-violet-600"
                />
                <StatCard
                    icon={IndianRupee}
                    label="Quote Value"
                    value={formatCurrency(quoteValue)}
                    sub="Combined total"
                    color="bg-violet-100 text-violet-700"
                />
                <StatCard
                    icon={Receipt}
                    label="Total Invoices"
                    value={invoiceCount}
                    sub="All invoices"
                    color="bg-orange-50 text-orange-500"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Invoice Value"
                    value={formatCurrency(invoiceValue)}
                    sub="Combined total"
                    color="bg-orange-100 text-orange-600"
                />
            </div>



            {/* ── Records Table / Card Section ─────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-700 text-sm">All Records</span>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                            {filtered.length}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                id="sales-search"
                                type="text"
                                placeholder="Search number or client…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 h-9 w-56 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Type Filter */}
                        <div className="flex h-9 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-xs font-bold">
                            {(['all', 'quotes', 'invoices', 'costing'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setTypeFilter(t)
                                        if (t === 'costing') setMainTab('costing')
                                        else setMainTab('hub')
                                    }}
                                    className={`px-3 capitalize transition-colors ${(typeFilter === t || (t === 'costing' && (mainTab as string) === 'costing')) ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="pl-8 pr-7 h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex h-9 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-2.5 transition-colors ${viewMode === 'table' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Table view"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`px-2.5 transition-colors ${viewMode === 'card' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Card view"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Import */}
                        <button
                            onClick={() => setImportModalOpen(true)}
                            className="flex items-center gap-1.5 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            Import
                        </button>
                    </div>
                </div>

                {/* ── TABLE VIEW ──────────────────────────────────── */}
                {viewMode === 'table' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left align-middle text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Number</th>
                                    <th className="px-5 py-3.5">Client</th>
                                    <th className="px-5 py-3.5">Date</th>
                                    <th className="px-5 py-3.5">Valid Until</th>
                                    <th className="px-5 py-3.5 text-right">Value (₹)</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-14 text-center">
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <FileText className="w-8 h-8 text-slate-200" />
                                                <p className="font-medium text-sm">No records found</p>
                                                <p className="text-xs">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(r => (
                                    <tr key={`${r.recordType}-${r.id}`} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-900 text-sm">{r.number}</div>
                                            <div className="mt-1">{getTypeBadge(r.recordType)}</div>
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-700 max-w-[200px] truncate">{r.client}</td>
                                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap" suppressHydrationWarning>
                                            {formatDate(r.date)}
                                        </td>
                                        <td className={`px-5 py-4 whitespace-nowrap font-medium ${isExpired(r) ? 'text-red-500' : 'text-slate-500'}`} suppressHydrationWarning>
                                            {r.validUntil ? formatDate(r.validUntil) : '—'}
                                        </td>
                                        <td className="px-5 py-4 font-black text-slate-700 text-right" suppressHydrationWarning>
                                            {formatCurrency(r.value)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <select
                                                value={r.status}
                                                onChange={(e) => handleDirectStatusChange(r, e.target.value)}
                                                className={`px-2 py-1 text-xs font-bold rounded-lg cursor-pointer outline-none transition-all border ${getStatusStyle(r.status)}`}
                                            >
                                                <option value="Sent">Sent</option>
                                                <option value="Draft">Draft</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Paid">Paid</option>
                                                <option value="Unpaid">Unpaid</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Expired">Expired</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(r.recordType === 'professional' || r.recordType === 'legacy') ? (
                                                    <button
                                                        onClick={() => { setSelectedQuote(r); setTagModalOpen(true); }}
                                                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                        title="Tag Status"
                                                    >
                                                        <Tag className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => { setSelectedInvoice(r); setPayModalOpen(true); }}
                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                        title="Pay Invoice"
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(r)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => alert('Activity log coming soon')}
                                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                    title="View Log"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {canWrite && (
                                                    <button
                                                        onClick={() => setDeleteTarget(r)}
                                                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── CARD VIEW ────────────────────────────────────── */}
                {viewMode === 'card' && (
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.length === 0 ? (
                            <div className="col-span-full py-12 text-center">
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <FileText className="w-8 h-8 text-slate-200" />
                                    <p className="font-medium text-sm">No records found</p>
                                </div>
                            </div>
                        ) : filtered.map(r => (
                            <div key={`${r.recordType}-${r.id}`} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow group bg-slate-50/50">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-black text-slate-900 text-sm">{r.number}</p>
                                        <div className="mt-1">{getTypeBadge(r.recordType)}</div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${getStatusStyle(r.status)}`}>
                                        {r.status}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-700 truncate mb-2">{r.client}</p>
                                <div className="flex justify-between text-xs text-slate-400 mb-3" suppressHydrationWarning>
                                    <span>{formatDate(r.date)}</span>
                                    {r.validUntil && <span className={isExpired(r) ? 'text-red-500 font-semibold' : ''}>Until {formatDate(r.validUntil)}</span>}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-black text-slate-800" suppressHydrationWarning>{formatCurrency(r.value)}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(r.recordType === 'professional' || r.recordType === 'legacy') ? (
                                            <button onClick={() => { setSelectedQuote(r); setTagModalOpen(true); }} className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-lg" title="Tag Status">
                                                <Tag className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <button onClick={() => { setSelectedInvoice(r); setPayModalOpen(true); }} className="p-1.5 text-emerald-500 hover:bg-emerald-100 rounded-lg" title="Pay Invoice">
                                                <CreditCard className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button onClick={() => handleEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => alert('Log coming soon')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg" title="Log">
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        {canWrite && (
                                            <button onClick={() => setDeleteTarget(r)} className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg" title="Delete">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Delete Confirm ───────────────────────────────── */}
            {deleteTarget && (
                <DeleteDialog
                    record={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirm}
                    isPending={isPending}
                />
            )}

            {/* ── Modals ───────────────────────────────────────── */}
            <TagQuoteModal
                isOpen={tagModalOpen}
                onClose={() => setTagModalOpen(false)}
                onSuccess={handleTagSuccess}
                currentStatus={selectedQuote?.status || 'Draft'}
                quoteNumber={selectedQuote?.number || ''}
            />

            <PayInvoiceModal
                isOpen={payModalOpen}
                onClose={() => setPayModalOpen(false)}
                onSuccess={handlePaySuccess}
                invoiceNumber={selectedInvoice?.number || ''}
                invoiceAmount={selectedInvoice?.value || 0}
            />

            <SalesBulkImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={(count) => alert(`Successfully uploaded ${count} bulk rows (Placeholder)`)}
            />
                </>
            )}
        </div>
    )
}
