'use client'

import React, { useState } from 'react'
import { X, UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'

interface SalesBulkImportModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (count: number) => void
}

export function SalesBulkImportModal({ isOpen, onClose, onSuccess }: SalesBulkImportModalProps) {
    const [status, setStatus] = useState<'idle' | 'parsing' | 'importing' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)
    const [fileParams, setFileParams] = useState<{ name: string; size: string } | null>(null)

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileParams({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
        })
        setStatus('parsing')
        
        // Simulate parsing
        setTimeout(() => {
            setStatus('idle')
        }, 1000)
    }

    const handleImport = () => {
        setStatus('importing')
        
        // Simulate importing
        setTimeout(() => {
            setStatus('success')
            setTimeout(() => {
                onSuccess(1) // Placeholder imported count
                onClose()
                setStatus('idle')
                setFileParams(null)
            }, 1500)
        }, 2000)
    }

    const reset = () => {
        setStatus('idle')
        setError(null)
        setFileParams(null)
    }

    const closeAll = () => {
        reset()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-slate-100 relative">
                <button
                    onClick={closeAll}
                    disabled={status === 'importing'}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors disabled:opacity-50"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <UploadCloud className="w-6 h-6 text-primary" />
                        Bulk Import Sales Data
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Upload a CSV file containing Quotations or Invoices to bulk add them to the system.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">Import Successful</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Sales records have been added successfully.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="text-sm font-bold text-red-800">Import Error</h5>
                                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        {!fileParams ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 transition-colors bg-white group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Click or drag CSV file here</p>
                                    <p className="text-xs text-slate-500 mt-1">Maximum file size 5MB</p>
                                    <a href="#" className="text-xs font-bold text-primary mt-4 hover:underline">
                                        Download Template CSV
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{fileParams.name}</p>
                                        <p className="text-xs text-slate-500">{fileParams.size}</p>
                                    </div>
                                </div>
                                {status !== 'importing' && (
                                    <button
                                        onClick={reset}
                                        className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                onClick={closeAll}
                                disabled={status === 'importing'}
                                className="px-5 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!fileParams || status === 'parsing' || status === 'importing'}
                                className="px-6 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 flex items-center gap-2"
                            >
                                {status === 'parsing' && 'Analyzing...'}
                                {status === 'importing' && (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Importing...
                                    </>
                                )}
                                {(status === 'idle' || status === 'error') && 'Import Records'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
