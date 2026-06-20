'use client'

import React, { useState } from 'react'
import { X, Search } from 'lucide-react'

interface TagQuoteModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (status: string) => void
    currentStatus: string
    quoteNumber: string
}

export function TagQuoteModal({ isOpen, onClose, onSuccess, currentStatus, quoteNumber }: TagQuoteModalProps) {
    const statuses = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']
    const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'Draft')

    if (!isOpen) return null

    const handleSave = () => {
        onSuccess(selectedStatus)
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
                    <h3 className="text-lg font-bold text-slate-900">Tag Status</h3>
                    <p className="text-sm text-slate-500 mt-1">Update status for quotation {quoteNumber}</p>
                </div>

                <div className="space-y-3 mb-6">
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={() => setSelectedStatus(s)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                                selectedStatus === s 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {s}
                            {selectedStatus === s && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </button>
                    ))}
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
                        className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                    >
                        Save Status
                    </button>
                </div>
            </div>
        </div>
    )
}
