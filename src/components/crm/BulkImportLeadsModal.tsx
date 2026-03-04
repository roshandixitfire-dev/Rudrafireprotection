'use client'

import { useState } from 'react'
import { bulkCreateLeadsAction } from '@/app/dashboard/crm/actions'
import { FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface BulkImportLeadsModalProps {
    isOpen: boolean;
    onClose: () => void
}

export default function BulkImportLeadsModal({ isOpen, onClose }: BulkImportLeadsModalProps) {
    const [rawText, setRawText] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null)

    if (!isOpen) return null;

    const handleImport = async () => {
        if (!rawText.trim()) return
        setLoading(true)
        setResult(null)

        try {
            const lines = rawText.trim().split('\n')
            const leads = lines.map(line => {
                const parts = line.split('\t')
                return {
                    sr_no: parts[0] || '',
                    sales_form_no: parts[1] || '',
                    sales_form_date: parts[2] || '',
                    source: parts[3] || '',
                    stage: parts[4] || '',
                    category: parts[5] || '',
                    location: parts[6] || '',
                    project_name: parts[7] || '',
                    developer: parts[8] || '',
                    configuration: parts[9] || '',
                    const_status: parts[10] || '',
                    owner_name: parts[11] || '',
                    finalizing_authority: parts[12] || '',
                    site_incharge: parts[13] || '',
                    architect: parts[14] || '',
                    remarks: parts[15] || '',
                }
            })

            const res = await bulkCreateLeadsAction(leads)
            setResult(res)
            if (res.success) {
                setTimeout(() => window.location.reload(), 2000)
            }
        } catch (e: any) {
            setResult({ success: false, error: e.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 m-0">Bulk Import Leads</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Copy & Paste from Excel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">✕</button>
                </div>

                <div className="p-8 space-y-6">
                    {result ? (
                        <div className={`p-6 rounded-3xl flex flex-col items-center text-center gap-4 ${result.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {result.success ? (
                                <>
                                    <CheckCircle2 className="w-12 h-12" />
                                    <div>
                                        <p className="text-lg font-black m-0">Success!</p>
                                        <p className="text-sm font-bold opacity-80 mt-1">Imported {result.count} leads successfully. Refreshing...</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-12 h-12" />
                                    <div>
                                        <p className="text-lg font-black m-0">Import Failed</p>
                                        <p className="text-sm font-bold opacity-80 mt-1">{result.error}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raw Data (Tab Separated)</label>
                                <textarea
                                    className="w-full h-64 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-xs font-mono focus:border-primary/50 focus:bg-white transition-all outline-none"
                                    placeholder="Paste rows from your excel/table here..."
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                />
                                <p className="text-[10px] text-slate-400 font-medium italic">Note: Ensure the columns match the order: SR, Form No, Date, Source, Stage, Category, Location, Project, Developer, Config, Status, Owner, Authority, Incharge, Architect, Remarks.</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-8 pt-0 flex justify-end gap-3">
                    {!result && (
                        <>
                            <button onClick={onClose} className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                            <button
                                onClick={handleImport}
                                disabled={loading || !rawText.trim()}
                                className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Import'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
