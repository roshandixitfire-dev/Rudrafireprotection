'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    X,
    Upload,
    Check,
    AlertCircle,
    Table as TableIcon,
    ArrowRight,
    Loader2,
    Info
} from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (count: number) => void
    clients: any[]
}

const DB_COLUMNS = [
    { key: 'client_name', label: 'Client / Society Name', required: true },
    { key: 'report_date', label: 'Report Date (YYYY-MM-DD)', required: true },
    { key: 'auditor_name', label: 'Auditor Name', required: true },
    { key: 'report_type', label: 'Report Type' },
    { key: 'status', label: 'Status' },
    { key: 'findings', label: 'Findings' },
    { key: 'recommendations', label: 'Recommendations' },
]

export const BulkImportAuditReportsModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, clients }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [rawText, setRawText] = useState('')
    const [parsedData, setParsedData] = useState<string[][]>([])
    const [mappings, setMappings] = useState<Record<number, string>>({})
    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleParse = () => {
        const rows = rawText
            .trim()
            .split('\n')
            .map(row => row.split('\t').map(cell => cell.trim()))

        if (rows.length < 2) {
            setError('Please paste at least one header row and one data row.')
            return
        }

        setParsedData(rows)

        const initialMappings: Record<number, string> = {}
        const headers = rows[0]

        headers.forEach((header, index) => {
            const match = DB_COLUMNS.find(col =>
                col.label.toLowerCase() === header.toLowerCase() ||
                col.key.toLowerCase() === header.toLowerCase()
            )
            if (match) {
                initialMappings[index] = match.key
            }
        })

        setMappings(initialMappings)
        setError(null)
        setStep(2)
    }

    const unmappedRequiredFields = DB_COLUMNS
        .filter(col => col.required)
        .filter(col => !Object.values(mappings).includes(col.key))

    const handleImport = async () => {
        setIsImporting(true)
        setError(null)

        try {
            const supabase = createClient()
            let importCount = 0

            const reportsToImport = []

            for (let i = 1; i < parsedData.length; i++) {
                const row = parsedData[i]
                const report: any = {}
                let rowClientName = ''

                Object.entries(mappings).forEach(([colIdx, dbKey]) => {
                    const value = row[parseInt(colIdx)]
                    if (dbKey && value) {
                        if (dbKey === 'client_name') {
                            rowClientName = value
                        } else {
                            report[dbKey] = value
                        }
                    }
                })

                if (!rowClientName) continue

                // Find client ID by name
                const matchedClient = clients.find(c =>
                    c.name?.toLowerCase().trim() === rowClientName.toLowerCase().trim()
                )

                if (matchedClient) {
                    report.client_id = matchedClient.id

                    // Fallbacks for optional fields
                    if (!report.report_type) report.report_type = 'Standard Fire Audit'
                    if (!report.status) report.status = 'Completed'

                    reportsToImport.push(report)
                }
            }

            if (reportsToImport.length === 0) {
                throw new Error('No valid records found to import. Check if the Client Names match the system records exactly.')
            }

            // Chunk inserts if too many
            const { error: insertError } = await supabase
                .from('audit_reports')
                .insert(reportsToImport)

            if (insertError) throw insertError

            importCount = reportsToImport.length

            onSuccess?.(importCount)
            reset()
            onClose()

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setIsImporting(false)
        }
    }

    const reset = () => {
        setStep(1)
        setRawText('')
        setParsedData([])
        setMappings({})
        setError(null)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-none">Bulk Import Audit Reports</h2>
                            <p className="text-xs text-slate-400 mt-1 font-medium italic">Paste historical data from Excel or Google Sheets</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { reset(); onClose(); }}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-8">
                    <div className={`flex items-center gap-2 text-sm font-bold ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                        Paste Data
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div className={`flex items-center gap-2 text-sm font-bold ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                        Map Columns
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div className={`flex items-center gap-2 text-sm font-bold ${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                        Review & Import
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700 font-medium">{error}</div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700">Paste your Excel data below:</label>
                                <div className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                    <Info className="w-3 h-3" /> Include Column Headers
                                </div>
                            </div>
                            <textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="Copy cells from Excel and paste here..."
                                className="w-full h-80 p-6 rounded-2xl border-2 border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-sm font-mono leading-relaxed bg-slate-50/30"
                            />
                            <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                    <TableIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-indigo-900">How to use:</div>
                                    <p className="text-xs text-indigo-700/70 mt-0.5">Open your Excel file, select the rows including the headers, copy (Ctrl+C), and paste here (Ctrl+V).</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {parsedData[0].map((header, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-100/50 transition-all">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Excel Column</div>
                                            <div className="text-sm font-bold text-slate-900">{header || `Column ${index + 1}`}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                            <select
                                                value={mappings[index] || ''}
                                                onChange={(e) => setMappings({ ...mappings, [index]: e.target.value })}
                                                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 outline-none hover:border-indigo-500/30 transition-all min-w-[180px]"
                                            >
                                                <option value="">Ignore Column</option>
                                                {DB_COLUMNS.map(col => (
                                                    <option key={col.key} value={col.key}>
                                                        {col.label} {col.required ? '*' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {unmappedRequiredFields.length > 0 && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-700 font-medium">
                                        Please map the following required fields: <span className="font-bold underline">{unmappedRequiredFields.map(f => f.label).join(', ')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-700">Review Data ({parsedData.length - 1} records ready)</h3>
                                <div className="text-[11px] text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-green-100 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Validated Format
                                </div>
                            </div>
                            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            {Object.entries(mappings).map(([_, dbKey]) => {
                                                const col = DB_COLUMNS.find(c => c.key === dbKey)
                                                return dbKey ? (
                                                    <th key={dbKey} className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                                                        {col?.label}
                                                    </th>
                                                ) : null
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {parsedData.slice(1, 6).map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-slate-50/50">
                                                {Object.keys(mappings).map((colIdx) => {
                                                    const dbKey = mappings[parseInt(colIdx)]
                                                    return dbKey ? (
                                                        <td key={colIdx} className="px-4 py-3 text-slate-600 font-medium truncate max-w-[150px]">
                                                            {row[parseInt(colIdx)] || <span className="text-slate-300 italic">empty</span>}
                                                        </td>
                                                    ) : null
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedData.length > 6 && (
                                <p className="text-[11px] text-slate-400 text-center font-bold uppercase tracking-widest bg-slate-50 py-3 rounded-xl border border-dashed border-slate-200">
                                    + {parsedData.length - 6} more rows not shown in preview
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <button
                        onClick={() => step === 1 ? onClose() : setStep((step - 1) as any)}
                        className="px-6 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                    >
                        {step === 1 ? 'Cancel' : 'Previous Step'}
                    </button>

                    <div className="flex items-center gap-3">
                        {step < 3 ? (
                            <button
                                onClick={() => step === 1 ? handleParse() : setStep(3)}
                                disabled={step === 1 ? !rawText.trim() : unmappedRequiredFields.length > 0}
                                className="px-8 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleImport}
                                disabled={isImporting}
                                className="px-10 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Importing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" /> Start Bulk Import
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
