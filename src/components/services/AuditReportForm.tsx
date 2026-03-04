'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Save, AlertCircle, FileText, Calendar, User, Search } from 'lucide-react'

interface Props {
    clients: any[]
    onClose: () => void
    onSuccess: () => void
}

export default function AuditReportForm({ clients, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [clientSearch, setClientSearch] = useState('')

    const [formData, setFormData] = useState({
        client_id: '',
        report_date: new Date().toISOString().split('T')[0],
        auditor_name: '',
        report_type: 'Standard Fire Audit',
        status: 'Draft',
        findings: '',
        recommendations: ''
    })

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(clientSearch.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            if (!formData.client_id) {
                throw new Error("Please select a client")
            }

            const payload = {
                client_id: parseInt(formData.client_id),
                report_date: formData.report_date,
                auditor_name: formData.auditor_name,
                report_type: formData.report_type,
                status: formData.status,
                findings: formData.findings,
                recommendations: formData.recommendations
            }

            const { error: insertError } = await supabase
                .from('audit_reports')
                .insert([payload])

            if (insertError) throw insertError

            onSuccess()
        } catch (err: any) {
            console.error('Audit Report Submit Error:', err)
            setError(err.message || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Digital Audit Report</h2>
                            <p className="text-sm text-slate-500 font-medium tracking-wide">Log a new fire safety audit</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(100vh-160px)]">
                    <form id="auditForm" onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 font-medium border border-red-100">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Client Selection */}
                            <div className="md:col-span-2 relative">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Client / Society</label>
                                <div className="p-3 border-2 border-slate-200 rounded-xl bg-slate-50 space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search active clients..."
                                            value={clientSearch}
                                            onChange={(e) => setClientSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg bg-white">
                                        {filteredClients.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, client_id: c.id.toString() })}
                                                className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-slate-50 last:border-0 hover:bg-indigo-50 transition-colors ${formData.client_id === c.id.toString() ? 'bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600' : 'text-slate-700'}`}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <Calendar className="w-3.5 h-3.5" /> Date of Audit
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.report_date}
                                    onChange={e => setFormData({ ...formData, report_date: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <User className="w-3.5 h-3.5" /> Auditor Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.auditor_name}
                                    onChange={e => setFormData({ ...formData, auditor_name: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Report Type</label>
                                <select
                                    value={formData.report_type}
                                    onChange={e => setFormData({ ...formData, report_type: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
                                >
                                    <option value="Standard Fire Audit">Standard Fire Audit</option>
                                    <option value="Risk Assessment">Risk Assessment</option>
                                    <option value="Pre-Occupancy Audit">Pre-Occupancy Audit</option>
                                    <option value="Compliance Check">Compliance Check</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Needs Review">Needs Review</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Findings</label>
                                <textarea
                                    value={formData.findings}
                                    onChange={e => setFormData({ ...formData, findings: e.target.value })}
                                    rows={4}
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 resize-none font-medium h-32"
                                    placeholder="Detail the audit findings here..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Recommendations</label>
                                <textarea
                                    value={formData.recommendations}
                                    onChange={e => setFormData({ ...formData, recommendations: e.target.value })}
                                    rows={4}
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 resize-none font-medium h-32"
                                    placeholder="List the recommended actions for the client..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="auditForm"
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 shadow-indigo-600/20 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? 'Saving...' : 'Save Audit Report'}
                        <Save className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    )
}
