'use client'

import React, { useState } from 'react'
import { X, Calendar, CreditCard, AlignLeft } from 'lucide-react'

interface PayInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (paymentData: any) => void
    invoiceNumber: string
    invoiceAmount: number
}

export function PayInvoiceModal({ isOpen, onClose, onSuccess, invoiceNumber, invoiceAmount }: PayInvoiceModalProps) {
    const [mode, setMode] = useState('Account')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [note, setNote] = useState('')

    if (!isOpen) return null

    const handleSave = () => {
        onSuccess({ mode, date, note })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Pay Invoice</h3>
                    <p className="text-sm text-slate-500 mt-1">Record payment for {invoiceNumber}</p>
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Amount</p>
                        <p className="text-xl font-black text-slate-900">₹{invoiceAmount?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Payment Mode</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={mode}
                                onChange={e => setMode(e.target.value)}
                                className="w-full pl-9 pr-4 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                                <option value="Account">Account Transfer (NEFT/RTGS)</option>
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="UPI">UPI</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Payment Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full pl-9 pr-4 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Note / Reference</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="E.g. UTR Number, Cheque Number"
                                className="w-full pl-9 pr-4 py-3 min-h-[80px] bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-y"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-sm shadow-orange-500/20"
                    >
                        Mark as Paid
                    </button>
                </div>
            </div>
        </div>
    )
}
