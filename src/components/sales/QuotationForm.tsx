'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, FileText, CheckCircle2, Loader2, Save } from 'lucide-react'
import { createQuotation, updateQuotation } from '@/app/dashboard/sales/actions'

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

    // Auto-generate number: RFP/25-26/0000X
    const [quotationNumber, setQuotationNumber] = useState(
        initialData?.quotation_number || `RFP/25-26/${String(Math.floor(1 + Math.random() * 9999)).padStart(5, '0')}`
    )

    // UI State
    const [formTab, setFormTab] = useState<'details' | 'quote_history' | 'approval_history'>('details')

    // Order Lines
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

    // --- Calculation Logic --- //
    const calculateLineTotal = (qty: number, price: number, taxRate: number) => {
        const base = qty * price
        const tax = base * (taxRate / 100)
        return Number((base + tax).toFixed(2))
    }

    const updateLine = (id: string, field: string, value: any) => {
        setLines(prev => prev.map(line => {
            if (line.id !== id) return line
            const updatedLine = { ...line, [field]: value }

            // Recalculate total if numerical fields change
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
        if (lines.length === 1) return // Keep at least one line
        setLines(prev => prev.filter(l => l.id !== id))
    }

    // Totals
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

        // Clean up items for the DB
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

            if (!result.success) {
                throw new Error(result.error)
            }

            // Provide full object back to table to avoid refresh
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEdit ? `Edit Quotation ${quotationNumber}` : 'New Quotation'}
                            </h2>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                Create a detailed quote for a client
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar (Odoo Style Segmented) */}
                    <div className="hidden lg:flex items-center overflow-hidden rounded-xl border border-slate-200">
                        {['Draft', 'Needs Approval', 'Requirement Change', 'Rejected', 'Approved', 'Submit'].map((s, idx, arr) => {
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
                                    {isActive && <div className="absolute right-0 top-1/2 -mt-2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-primary z-10 translate-x-full"></div>}
                                    {s}
                                </button>
                            )
                        })}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200 text-sm">
                        {error}
                    </div>
                )}

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto w-full p-6 pb-12">
                    <form id="quote-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-slate-200">
                            {[
                                { id: 'details', label: 'Details' },
                                { id: 'quote_history', label: 'Quote History' },
                                { id: 'approval_history', label: 'Approval History' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setFormTab(tab.id as any)}
                                    className={`px-6 py-3 text-sm font-bold tracking-wide transition-colors border-b-2 ${formTab === tab.id ? 'text-primary border-primary bg-slate-50/50' : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50/30'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content: Details */}
                        <div className={`transition-opacity duration-300 space-y-8 ${formTab === 'details' ? 'block' : 'hidden'}`}>
                            {/* Master Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50 p-6 rounded-b-2xl rounded-tr-2xl border border-slate-100">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quote Name</label>
                                            <input
                                                type="text"
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={quoteName}
                                                onChange={(e) => setQuoteName(e.target.value)}
                                                placeholder="E.g., Server Rack Setup"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quote Number</label>
                                            <input
                                                type="text"
                                                className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none"
                                                value={quotationNumber}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quote Code</label>
                                            <input
                                                type="text"
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={quoteCode}
                                                onChange={(e) => setQuoteCode(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer / Account</label>
                                            <select
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={clientId}
                                                onChange={(e) => setClientId(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>Select a client...</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deal / Opportunity</label>
                                            <input
                                                type="text"
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={deal}
                                                onChange={(e) => setDeal(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quote Type</label>
                                            <select
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Door Type</label>
                                            <select
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quotation Date</label>
                                            <input
                                                type="date"
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={quotationDate}
                                                onChange={(e) => setQuotationDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiration Date</label>
                                            <input
                                                type="date"
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={expirationDate}
                                                onChange={(e) => setExpirationDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valid Till (Terms)</label>
                                        <select
                                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

                            {/* Order Lines Section */}
                            <div>
                                <div className="flex border-b border-slate-200 mb-4">
                                    <div className="px-4 py-2 border-b-2 border-primary text-primary font-bold text-sm">
                                        Order Lines
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left align-middle border-collapse">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-3 w-[45%]">Description</th>
                                                <th className="px-3 py-3 w-[15%]">Quantity</th>
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
                                                            className="w-full p-2 bg-transparent hover:bg-white border hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                                                            placeholder="Product or service description"
                                                            value={line.product_description}
                                                            onChange={(e) => updateLine(line.id, 'product_description', e.target.value)}
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            className="w-full p-2 bg-transparent hover:bg-white border hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                            value={line.quantity || ''}
                                                            onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            className="w-full p-2 bg-transparent hover:bg-white border hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                            value={line.unit_price || ''}
                                                            onChange={(e) => updateLine(line.id, 'unit_price', e.target.value)}
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            className="w-full p-2 bg-transparent hover:bg-white border hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
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
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLine(line.id)}
                                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            disabled={lines.length === 1}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={addLine}
                                        className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Add a product
                                    </button>
                                </div>

                                {/* Breakdown & Totals */}
                                <div className="flex flex-col md:flex-row justify-between gap-8 pt-8 border-t border-slate-100 mt-8">
                                    {/* Notes */}
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Terms and Conditions</label>
                                        <textarea
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[120px]"
                                            placeholder="Enter terms and conditions, warranty details, or customer notes..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    {/* Summary Right Align */}
                                    <div className="w-full md:w-80 space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Untaxed Amount:</span>
                                            <span className="font-bold text-slate-800">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                                            <span className="text-slate-500 font-medium">Taxes:</span>
                                            <span className="font-bold text-slate-800">₹{taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-lg font-black text-slate-900">Total:</span>
                                            <span className="text-2xl font-black text-primary">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Content: Quote History */}
                        <div className={`transition-opacity duration-300 ${formTab === 'quote_history' ? 'block' : 'hidden'}`}>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                                <p className="text-slate-500 font-medium">No past revisions for this quote.</p>
                            </div>
                        </div>

                        {/* Tab Content: Approval History */}
                        <div className={`transition-opacity duration-300 ${formTab === 'approval_history' ? 'block' : 'hidden'}`}>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                                <p className="text-slate-500 font-medium">No approval requests yet.</p>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 h-11 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="quote-form"
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 h-11 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{isEdit ? 'Save Changes' : 'Confirm Quotation'}</span>
                    </button>
                </div>

            </div>
        </div>
    )
}
