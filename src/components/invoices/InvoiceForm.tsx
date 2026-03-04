'use client'

import { useState, useMemo, useEffect } from 'react'
import {
    Plus,
    Trash2,
    Upload,
    FileText,
    Calendar,
    MapPin,
    User,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Save,
    Send,
    Download,
    Image as ImageIcon
} from 'lucide-react'

interface LineItem {
    id: string
    label: string
    price: number
    quantity: number
    taxPercent: number
}

const INDIAN_STATES = [
    "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat",
    "West Bengal", "Uttar Pradesh", "Telangana", "Rajasthan", "Other"
]

export default function InvoiceForm() {
    const [status, setStatus] = useState<'draft' | 'posted'>('draft')
    const [logo, setLogo] = useState<string | null>(null)
    const [customer, setCustomer] = useState('')
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState('')
    const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra')
    const [gstTreatment, setGstTreatment] = useState('registered')
    const [activeTab, setActiveTab] = useState<'lines' | 'info'>('lines')

    // Line Items State
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: '1', label: '', price: 0, quantity: 1, taxPercent: 18 }
    ])

    const addLineItem = () => {
        setLineItems([...lineItems, {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            price: 0,
            quantity: 1,
            taxPercent: 18
        }])
    }

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id))
        }
    }

    const updateLineItem = (id: string, updates: Partial<LineItem>) => {
        setLineItems(lineItems.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    // Calculations
    const untaxedAmount = useMemo(() => {
        return lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }, [lineItems])

    const gstBreakdown = useMemo(() => {
        const isIntraState = placeOfSupply === 'Maharashtra' // Assuming Rudra is in MH
        let cgst = 0
        let sgst = 0
        let igst = 0

        lineItems.forEach(item => {
            const taxAmount = (item.price * item.quantity * item.taxPercent) / 100
            if (isIntraState) {
                cgst += taxAmount / 2
                sgst += taxAmount / 2
            } else {
                igst += taxAmount
            }
        })

        return { cgst, sgst, igst }
    }, [lineItems, placeOfSupply])

    const totalTax = gstBreakdown.cgst + gstBreakdown.sgst + gstBreakdown.igst
    const totalAmount = untaxedAmount + totalTax

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20">
            {/* Top Status Bar (Odoo Style) */}
            <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setStatus('posted')}
                        className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${status === 'draft' ? 'bg-[#714b67] text-white hover:bg-[#5a3c52]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        Confirm
                    </button>
                    <div className="flex items-center gap-2 text-slate-400 border-l border-slate-200 pl-4">
                        <Save className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                        <Send className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                        <Download className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <div className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${status === 'draft' ? 'bg-white text-[#714b67] shadow-sm' : 'text-slate-400'}`}>Draft</div>
                    <div className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${status === 'posted' ? 'bg-white text-[#714b67] shadow-sm' : 'text-slate-400'}`}>Posted</div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8 px-4">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Invoice Header Section */}
                    <div className="p-10 border-b border-slate-100">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Customer Invoice</span>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Draft</h1>
                            </div>

                            {/* Logo Upload Widget */}
                            <div className="group relative w-32 h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50 transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer overflow-hidden">
                                {logo ? (
                                    <img src={logo} alt="Logo" className="w-full h-full object-contain p-4" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                                        <span className="text-[9px] font-black text-slate-400 mt-2 uppercase">Upload Logo</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => setLogo(reader.result as string)
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Main Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="w-32 text-xs font-bold text-slate-500">Customer</label>
                                    <div className="flex-1 relative">
                                        <input
                                            value={customer}
                                            onChange={(e) => setCustomer(e.target.value)}
                                            placeholder="Search a name or Tax ID..."
                                            className="w-full border-b border-slate-200 focus:border-primary py-1 text-sm outline-none transition-all placeholder:italic placeholder:text-slate-300"
                                        />
                                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="w-32 text-xs font-bold text-slate-500">Place of supply</label>
                                    <select
                                        value={placeOfSupply}
                                        onChange={(e) => setPlaceOfSupply(e.target.value)}
                                        className="flex-1 border-b border-slate-200 focus:border-primary py-1 text-sm outline-none bg-transparent"
                                    >
                                        {INDIAN_STATES.map(state => <option key={state} value={state}>{state} (IN)</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="w-32 text-xs font-bold text-slate-500">GST Treatment</label>
                                    <select
                                        value={gstTreatment}
                                        onChange={(e) => setGstTreatment(e.target.value)}
                                        className="flex-1 border-b border-slate-200 focus:border-primary py-1 text-sm outline-none bg-transparent"
                                    >
                                        <option value="registered">Registered Business</option>
                                        <option value="consumer">Consumer / Unregistered</option>
                                        <option value="overseas">Overseas</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="w-32 text-xs font-bold text-slate-500">Invoice Date</label>
                                    <input
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        className="flex-1 border-b border-slate-200 focus:border-primary py-1 text-sm outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="w-32 text-xs font-bold text-slate-500">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="flex-1 border-b border-slate-200 focus:border-primary py-1 text-sm outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="w-32 text-xs font-bold text-slate-500">Payment Terms</label>
                                    <select className="flex-1 border-b border-slate-200 focus:border-primary py-1 text-sm outline-none bg-transparent">
                                        <option>Immediate Payment</option>
                                        <option>15 Days</option>
                                        <option>30 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="px-10">
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('lines')}
                                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'lines' ? 'border-[#714b67] text-[#714b67]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Invoice Lines
                            </button>
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'info' ? 'border-[#714b67] text-[#714b67]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Other Info
                            </button>
                        </div>

                        <div className="py-8">
                            {activeTab === 'lines' ? (
                                <div className="space-y-4">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Label</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Taxes</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                                                <th className="pb-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {lineItems.map((item) => (
                                                <tr key={item.id} className="group transition-all hover:bg-slate-50/50">
                                                    <td className="py-4">
                                                        <input
                                                            value={item.label}
                                                            onChange={(e) => updateLineItem(item.id, { label: e.target.value })}
                                                            placeholder="Add a product or description..."
                                                            className="w-full bg-transparent outline-none text-sm font-medium"
                                                        />
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(item.id, { quantity: Number(e.target.value) })}
                                                            className="w-20 text-right bg-transparent outline-none text-sm font-medium pr-2"
                                                        />
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateLineItem(item.id, { price: Number(e.target.value) })}
                                                            className="w-24 text-right bg-transparent outline-none text-sm font-medium pr-2"
                                                        />
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <select
                                                            value={item.taxPercent}
                                                            onChange={(e) => updateLineItem(item.id, { taxPercent: Number(e.target.value) })}
                                                            className="text-right bg-transparent outline-none text-[10px] font-black text-primary uppercase"
                                                        >
                                                            <option value={0}>0%</option>
                                                            <option value={5}>GST 5%</option>
                                                            <option value={12}>GST 12%</option>
                                                            <option value={18}>GST 18%</option>
                                                            <option value={28}>GST 28%</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4 text-right text-sm font-bold text-slate-900">
                                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button
                                                            onClick={() => removeLineItem(item.id)}
                                                            className="p-2 opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button
                                        onClick={addLineItem}
                                        className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add a line
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Notes</h5>
                                        <textarea
                                            placeholder="Write internal notes about this invoice..."
                                            className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-primary transition-all resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Info</h5>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4">
                                                <label className="w-32 text-[10px] font-bold text-slate-400 uppercase">Bank Detail</label>
                                                <input className="flex-1 border-b border-slate-100 text-xs py-1" placeholder="HDFC Bank..." />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="w-32 text-[10px] font-bold text-slate-400 uppercase">Account No.</label>
                                                <input className="flex-1 border-b border-slate-100 text-xs py-1" placeholder="XXXX XXXX XXXX" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Section */}
                    <div className="bg-[#fcfdfe] p-10 flex flex-col items-end border-t border-slate-100">
                        <div className="w-full max-w-sm space-y-4">
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="text-xs font-bold uppercase tracking-widest">Untaxed Amount</span>
                                <span className="text-sm font-black">₹{untaxedAmount.toLocaleString('en-IN')}</span>
                            </div>

                            {placeOfSupply === 'Maharashtra' ? (
                                <>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">CGST</span>
                                        <span className="text-xs font-bold">₹{gstBreakdown.cgst.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">SGST</span>
                                        <span className="text-xs font-bold">₹{gstBreakdown.sgst.toLocaleString('en-IN')}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">IGST</span>
                                    <span className="text-xs font-bold">₹{gstBreakdown.igst.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Total</span>
                                <span className="text-2xl font-black text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions (Below Card) */}
                <div className="mt-8">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Terms and Conditions</h5>
                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-dashed border-slate-200 text-[10px] text-slate-400 leading-relaxed font-medium">
                        1. Goods once sold will not be taken back or exchanged.<br />
                        2. All disputes subject to Mumbai Jurisdiction.<br />
                        3. Payment should be made within the due date to avoid interest @18% p.a.
                    </div>
                </div>
            </div>
        </div>
    )
}
