'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, FileText, Loader2, Save } from 'lucide-react'
import { createQuotation, updateQuotation } from '@/app/dashboard/sales/actions'
import { useFormDraft } from '@/hooks/useFormDraft'
import DraftNoticeBanner from '@/components/common/DraftNoticeBanner'

interface QuotationFormProps {
    isOpen: boolean
    onClose: () => void
    initialData?: any
    clients: any[]
    onSuccess: (data: any, isEdit: boolean) => void
}

export default function QuotationForm({ isOpen, onClose, initialData, clients, onSuccess }: QuotationFormProps) {
    const isEdit = !!initialData

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Master fields
    const [clientId, setClientId] = useState<string>(initialData?.client_id?.toString() || '')
    const [quoteName, setQuoteName] = useState(initialData?.quote_name || '')
    const [quoteCode, setQuoteCode] = useState(initialData?.quote_code || '')
    const [account, setAccount] = useState(initialData?.account || '')
    const [deal, setDeal] = useState(initialData?.deal || '')
    const [quoteType, setQuoteType] = useState(initialData?.quote_type || '')
    const [doorType, setDoorType] = useState(initialData?.door_type || '')
    const [quotationDate, setQuotationDate] = useState(
        initialData?.quotation_date ? new Date(initialData.quotation_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [expirationDate, setExpirationDate] = useState(
        initialData?.expiration_date ? new Date(initialData.expiration_date).toISOString().split('T')[0] : ''
    )
    const [paymentTerms, setPaymentTerms] = useState(initialData?.payment_terms || 'Immediate Payment')
    const [status, setStatus] = useState(initialData?.status || 'Draft')
    const [notes, setNotes] = useState(initialData?.notes || '')

    const [quotationNumber] = useState(
        initialData?.quotation_number || `RFP/25-26/${String(Math.floor(1 + Math.random() * 9999)).padStart(5, '0')}`
    )

    const [formTab, setFormTab] = useState<'details' | 'quote_history' | 'approval_history'>('details')

    const [lines, setLines] = useState<any[]>(initialData?.items?.length > 0 ? initialData.items : [{
        id: crypto.randomUUID(),
        product_description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 0,
        total_price: 0,
        sort_order: 0
    }])

    useEffect(() => {
        if (!isOpen) return
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    const {
        hasDraft,
        draftTime,
        lastSavedNotice,
        saveDraft,
        clearDraft,
        restoreDraft,
        discardDraft
    } = useFormDraft<any>({
        storageKey: 'draft_quote_modal',
        isEditingExisting: isEdit,
        onRestore: (draft) => {
            if (draft) {
                if (draft.clientId) setClientId(draft.clientId)
                if (draft.quoteName) setQuoteName(draft.quoteName)
                if (draft.quoteCode) setQuoteCode(draft.quoteCode)
                if (draft.account) setAccount(draft.account)
                if (draft.deal) setDeal(draft.deal)
                if (draft.quoteType) setQuoteType(draft.quoteType)
                if (draft.doorType) setDoorType(draft.doorType)
                if (draft.notes) setNotes(draft.notes)
                if (draft.lines && draft.lines.length > 0) setLines(draft.lines)
            }
        }
    })

    useEffect(() => {
        if (!isEdit && isOpen && (quoteName || clientId || notes || lines.some((l: any) => l.product_description))) {
            const timer = setTimeout(() => {
                saveDraft({ clientId, quoteName, quoteCode, account, deal, quoteType, doorType, notes, lines })
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [clientId, quoteName, quoteCode, account, deal, quoteType, doorType, notes, lines, isEdit, isOpen, saveDraft])

    const calculateLineTotal = (qty: number, price: number, taxRate: number) => {
        const base = qty * price
        const tax = base * (taxRate / 100)
        return Number((base + tax).toFixed(2))
    }

    const updateLine = (id: string, field: string, value: any) => {
        setLines(prev => prev.map(line => {
            if (line.id !== id) return line
            const updatedLine = { ...line, [field]: value }
            if (['quantity', 'unit_price', 'tax_rate'].includes(field)) {
                updatedLine.total_price = calculateLineTotal(
                    Number(updatedLine.quantity) || 0,
                    Number(updatedLine.unit_price) || 0,
                    Number(updatedLine.tax_rate) || 0
                )
            }
            return updatedLine
        }))
    }

    const addLine = () => {
        setLines(prev => [...prev, {
            id: crypto.randomUUID(),
            product_description: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: 0,
            total_price: 0,
            sort_order: prev.length
        }])
    }

    const removeLine = (id: string) => {
        if (lines.length === 1) return
        setLines(prev => prev.filter(l => l.id !== id))
    }

    const subtotal = lines.reduce((acc, line) => acc + ((Number(line.quantity) || 0) * (Number(line.unit_price) || 0)), 0)
    const taxTotal = lines.reduce((acc, line) => {
        const base = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0)
        return acc + (base * ((Number(line.tax_rate) || 0) / 100))
    }, 0)
    const grandTotal = subtotal + taxTotal

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!clientId) {
            setError("Please select a client.")
            return
        }

        const cleanedLines = lines
            .filter(l => l.product_description.trim() !== '')
            .map((l, index) => ({
                product_description: l.product_description,
                quantity: Number(l.quantity),
                unit_price: Number(l.unit_price),
                tax_rate: Number(l.tax_rate),
                total_price: Number(l.total_price),
                sort_order: index
            }))

        if (cleanedLines.length === 0) {
            setError("You must add at least one valid order line to save the quotation.")
            return
        }

        setLoading(true)

        const payload = {
            quotation_number: quotationNumber,
            client_id: Number(clientId),
            quote_name: quoteName,
            quote_code: quoteCode,
            account,
            deal,
            quote_type: quoteType,
            door_type: quoteType === 'Door' ? doorType : null,
            quotation_date: quotationDate,
            expiration_date: expirationDate || undefined,
            payment_terms: paymentTerms,
            status,
            notes,
            subtotal,
            tax_total: taxTotal,
            grand_total: grandTotal
        }

        try {
            let result
            if (isEdit) {
                result = await updateQuotation(initialData.id, payload, cleanedLines)
            } else {
                result = await createQuotation(payload, cleanedLines)
            }

            if (!result.success) throw new Error(result.error)

            clearDraft()
            onSuccess({
                id: isEdit ? initialData.id : (result as any).data?.id,
                ...payload,
                clients: clients.find(c => c.id.toString() === clientId)
            }, isEdit)
            onClose()

        } catch (err: any) {
            setError(err.message || 'An error occurred while saving the quotation.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal: full-screen sheet on mobile, centered dialog on sm+ */}
            <div className="relative w-full sm:max-w-6xl h-[95dvh] sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 rounded-t-2xl overflow-hidden">

                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-xl flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">
                                {isEdit ? `Edit • ${quotationNumber}` : 'New Quotation'}
                            </h2>
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 hidden sm:block">
                                Create a detailed quote for a client
                            </p>
                        </div>
                    </div>

                    {/* Status progress — only desktop */}
                    <div className="hidden lg:flex items-center overflow-hidden rounded-xl border border-slate-200 mx-4">
                        {['Draft', 'Needs Approval', 'Requirement Change', 'Rejected', 'Approved', 'Submit'].map((s, idx) => {
                            const isActive = status === s
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    className={`relative px-4 py-2 text-xs font-bold transition-colors flex items-center
                                        ${isActive ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
                                        ${idx !== 0 ? 'border-l border-white/20' : ''}
                                    `}
                                >
                                    {isActive && <div className="absolute right-0 top-1/2 -mt-2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-primary z-10 translate-x-full" />}
                                    {s}
                                </button>
                            )
                        })}
                    </div>

                    {/* Mobile: status pill */}
                    <div className="flex lg:hidden items-center gap-2 mr-2">
                        <select
                            className="h-8 px-2 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-lg focus:outline-none"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {['Draft', 'Needs Approval', 'Requirement Change', 'Rejected', 'Approved', 'Submit'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-4 sm:px-6 pt-4">
                    <DraftNoticeBanner
                        hasDraft={hasDraft}
                        draftTime={draftTime}
                        lastSavedNotice={lastSavedNotice}
                        onRestore={restoreDraft}
                        onDiscard={discardDraft}
                    />
                </div>

                {/* ── ERROR BANNER ── */}
                {error && (
                    <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200 text-xs sm:text-sm flex-shrink-0">
                        {error}
                    </div>
                )}

                {/* ── BODY (scrollable) ── */}
                <div className="flex-1 overflow-y-auto w-full">
                    <form id="quote-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 pb-4">

                        {/* Tab Navigation */}
                        <div className="flex border-b border-slate-200 overflow-x-auto">
                            {[
                                { id: 'details', label: 'Details' },
                                { id: 'quote_history', label: 'Quote History' },
                                { id: 'approval_history', label: 'Approval History' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setFormTab(tab.id as any)}
                                    className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-wide transition-colors border-b-2 whitespace-nowrap flex-shrink-0
                                        ${formTab === tab.id ? 'text-primary border-primary bg-slate-50/50' : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50/30'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── DETAILS TAB ── */}
                        <div className={`space-y-6 ${formTab === 'details' ? 'block' : 'hidden'}`}>

                            {/* Master Info: 2-col on md+, 1-col on mobile */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">

                                {/* LEFT COLUMN */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quote Name</label>
                                            <input
                                                type="text"
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={quoteName}
                                                onChange={(e) => setQuoteName(e.target.value)}
                                                placeholder="E.g., Server Rack Setup"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quote Number</label>
                                            <input
                                                type="text"
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none"
                                                value={quotationNumber}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quote Code</label>
                                            <input
                                                type="text"
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={quoteCode}
                                                onChange={(e) => setQuoteCode(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Customer / Account</label>
                                            <select
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={clientId}
                                                onChange={(e) => setClientId(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>Select a client...</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deal / Opportunity</label>
                                            <input
                                                type="text"
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={deal}
                                                onChange={(e) => setDeal(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quote Type</label>
                                            <select
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={quoteType}
                                                onChange={(e) => setQuoteType(e.target.value)}
                                            >
                                                <option value="">Select Type...</option>
                                                <option value="AMC">AMC</option>
                                                <option value="Repair">Repair</option>
                                                <option value="New Installation">New Installation</option>
                                                <option value="FRD">FRD</option>
                                                <option value="Door">Door</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    {quoteType === 'Door' && (
                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Door Type</label>
                                            <select
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={doorType}
                                                onChange={(e) => setDoorType(e.target.value)}
                                            >
                                                <option value="">Select Door Type...</option>
                                                <option value="Metal Fire Door">Metal Fire Door</option>
                                                <option value="Wooden Fire Door">Wooden Fire Door</option>
                                                <option value="Acoustic Door">Acoustic Door</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quotation Date</label>
                                            <input
                                                type="date"
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={quotationDate}
                                                onChange={(e) => setQuotationDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiration Date</label>
                                            <input
                                                type="date"
                                                className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={expirationDate}
                                                onChange={(e) => setExpirationDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Valid Till (Terms)</label>
                                        <select
                                            className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={paymentTerms}
                                            onChange={(e) => setPaymentTerms(e.target.value)}
                                        >
                                            <option value="Immediate Payment">Immediate Payment</option>
                                            <option value="15 Days">15 Days</option>
                                            <option value="30 Days">30 Days</option>
                                            <option value="45 Days">45 Days</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ── ORDER LINES ── */}
                            <div>
                                <div className="flex border-b border-slate-200 mb-4">
                                    <div className="px-4 py-2 border-b-2 border-primary text-primary font-bold text-sm">
                                        Order Lines
                                    </div>
                                </div>

                                {/* MOBILE: card-per-line layout */}
                                <div className="block sm:hidden space-y-3">
                                    {lines.map((line, idx) => (
                                        <div key={line.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line {idx + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(line.id)}
                                                    disabled={lines.length === 1}
                                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                                <textarea
                                                    rows={2}
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium"
                                                    placeholder="Product or service description"
                                                    value={line.product_description}
                                                    onChange={(e) => updateLine(line.id, 'product_description', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Qty</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        className="w-full h-9 px-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-center"
                                                        value={line.quantity || ''}
                                                        onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price ₹</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        className="w-full h-9 px-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-center"
                                                        value={line.unit_price || ''}
                                                        onChange={(e) => updateLine(line.id, 'unit_price', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tax</label>
                                                    <select
                                                        className="w-full h-9 px-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none font-medium"
                                                        value={line.tax_rate}
                                                        onChange={(e) => updateLine(line.id, 'tax_rate', e.target.value)}
                                                    >
                                                        <option value="0">0%</option>
                                                        <option value="5">5%</option>
                                                        <option value="12">12%</option>
                                                        <option value="18">18%</option>
                                                        <option value="28">28%</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                                                <span className="text-xs text-slate-500 font-medium">Subtotal</span>
                                                <span className="text-sm font-black text-slate-800">
                                                    ₹{line.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* DESKTOP: table layout */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full text-sm text-left align-middle border-collapse">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-3 w-[45%]">Description</th>
                                                <th className="px-3 py-3 w-[13%]">Quantity</th>
                                                <th className="px-3 py-3 w-[15%]">Unit Price (₹)</th>
                                                <th className="px-3 py-3 w-[12%]">Taxes (%)</th>
                                                <th className="px-3 py-3 w-[15%] text-right">Subtotal</th>
                                                <th className="px-2 py-3 w-[3%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {lines.map((line) => (
                                                <tr key={line.id} className="group hover:bg-slate-50/50">
                                                    <td className="p-2">
                                                        <textarea
                                                            rows={2}
                                                            className="w-full p-2 bg-transparent hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                                                            placeholder="Product or service description"
                                                            value={line.product_description}
                                                            onChange={(e) => updateLine(line.id, 'product_description', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" min="0" step="any"
                                                            className="w-full p-2 bg-transparent hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                            value={line.quantity || ''}
                                                            onChange={(e) => updateLine(line.id, 'quantity', e.target.value)} />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" min="0" step="any"
                                                            className="w-full p-2 bg-transparent hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                            value={line.unit_price || ''}
                                                            onChange={(e) => updateLine(line.id, 'unit_price', e.target.value)} />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            className="w-full p-2 bg-transparent hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                            value={line.tax_rate}
                                                            onChange={(e) => updateLine(line.id, 'tax_rate', e.target.value)}
                                                        >
                                                            <option value="0">0%</option>
                                                            <option value="5">5%</option>
                                                            <option value="12">12%</option>
                                                            <option value="18">18%</option>
                                                            <option value="28">28%</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2 text-right font-black text-slate-700">
                                                        ₹{line.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button type="button" onClick={() => removeLine(line.id)}
                                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            disabled={lines.length === 1}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4">
                                    <button type="button" onClick={addLine} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                                        <Plus className="w-4 h-4" /> Add a product
                                    </button>
                                </div>

                                {/* Totals + Notes */}
                                <div className="flex flex-col md:flex-row justify-between gap-6 pt-6 border-t border-slate-100 mt-6">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Terms and Conditions</label>
                                        <textarea
                                            className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[100px] sm:min-h-[120px]"
                                            placeholder="Enter terms and conditions, warranty details, or customer notes..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="w-full md:w-72 space-y-3 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 h-fit">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Untaxed Amount:</span>
                                            <span className="font-bold text-slate-800">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                                            <span className="text-slate-500 font-medium">Taxes:</span>
                                            <span className="font-bold text-slate-800">₹{taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-base font-black text-slate-900">Total:</span>
                                            <span className="text-xl sm:text-2xl font-black text-primary">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quote History Tab */}
                        <div className={formTab === 'quote_history' ? 'block' : 'hidden'}>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                                <p className="text-slate-500 font-medium">No past revisions for this quote.</p>
                            </div>
                        </div>

                        {/* Approval History Tab */}
                        <div className={formTab === 'approval_history' ? 'block' : 'hidden'}>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                                <p className="text-slate-500 font-medium">No approval requests yet.</p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ── FOOTER ── */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 h-11 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="quote-form"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 h-11 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Save Changes' : 'Confirm Quotation'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
