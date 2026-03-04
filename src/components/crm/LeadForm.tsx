'use client'

import { useState, useEffect } from 'react'
import { createLeadAction, updateLeadAction, getLeadsAction } from '@/app/dashboard/crm/actions'
import {
    User,
    MapPin,
    Calendar,
    Target,
    Activity,
    Info,
    CheckCircle2,
    Building2,
    FileText,
    Smartphone,
    AlertCircle,
    Globe,
    Shield
} from 'lucide-react'

interface LeadFormProps {
    onClose?: () => void
    initialData?: any
}

export default function LeadForm({ onClose, initialData }: LeadFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [autoData, setAutoData] = useState({ sr_no: '', sales_form_no: '' })

    const getInit = (key: string) => initialData?.[key] || ''

    useEffect(() => {
        if (!initialData) {
            fetchNextNumbers()
        }
    }, [initialData])

    async function fetchNextNumbers() {
        try {
            const result = await getLeadsAction()
            if (result.success && result.data) {
                const leads = result.data

                // Calculate next SR.NO
                const maxSrNo = leads.reduce((max: number, lead: any) => {
                    const num = parseInt(lead.sr_no)
                    return !isNaN(num) ? Math.max(max, num) : max
                }, 0)
                const nextSrNo = (maxSrNo + 1).toString()

                // Calculate next Sales Form No: RFP/25-26/0001
                const now = new Date()
                const year = now.getFullYear()
                const month = now.getMonth() // 0-indexed
                let fiscalYear = ''
                if (month >= 3) { // April onwards
                    fiscalYear = `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`
                } else {
                    fiscalYear = `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`
                }

                const pattern = new RegExp(`RFP/${fiscalYear}/(\\d+)`)
                const maxFormNum = leads.reduce((max: number, lead: any) => {
                    const match = lead.sales_form_no?.match(pattern)
                    if (match) {
                        const num = parseInt(match[1])
                        return !isNaN(num) ? Math.max(max, num) : max
                    }
                    return max
                }, 0)

                const nextFormNo = `RFP/${fiscalYear}/${(maxFormNum + 1).toString().padStart(4, '0')}`

                setAutoData({ sr_no: nextSrNo, sales_form_no: nextFormNo })
            }
        } catch (err) {
            console.error('Error fetching next numbers:', err)
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        try {
            let result
            if (initialData?.id) {
                result = await updateLeadAction(initialData.id, formData)
            } else {
                result = await createLeadAction(formData)
            }

            if (result.success) {
                if (onClose) onClose()
                window.location.reload()
            } else {
                setError(result.error || 'Failed to save lead')
            }
        } catch (e: any) {
            console.error('Error handling lead form submission:', e)
            setError(e.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content !p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 m-0">{initialData ? 'Edit Sales Lead' : 'New Sales Lead'}</h2>
                            <p className="text-[10px] text-slate-500 font-medium italic">CRM Lead Management System</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-100 mb-4 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

                    <form action={handleSubmit} id="lead-form" className="space-y-6">
                        {/* Section 1: Basic Details */}
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 pb-2 mb-4 flex items-center gap-2 border-b border-slate-200/60">
                                <Info className="w-3.5 h-3.5 text-primary" /> Core Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="form-group">
                                    <label>SR.NO</label>
                                    <input name="sr_no" defaultValue={getInit('sr_no') || autoData.sr_no} placeholder="e.g. 1" />
                                </div>
                                <div className="form-group">
                                    <label>Sales Form No</label>
                                    <input name="sales_form_no" defaultValue={getInit('sales_form_no') || autoData.sales_form_no} placeholder="e.g. RFP/25-26/0001" />
                                </div>
                                <div className="form-group">
                                    <label>Sales Form Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input type="date" name="sales_form_date" className="pl-8 w-full" defaultValue={getInit('sales_form_date')} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Source</label>
                                    <input name="source" defaultValue={getInit('source')} list="sourceOptions" placeholder="e.g. WOM" />
                                </div>
                                <div className="form-group">
                                    <label>Stage</label>
                                    <input name="stage" defaultValue={getInit('stage')} list="stageOptions" placeholder="e.g. Qualified" />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input name="category" defaultValue={getInit('category')} list="categoryOptions" placeholder="e.g. Hot" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Project Details */}
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 pb-2 mb-4 flex items-center gap-2 border-b border-slate-200/60">
                                <Building2 className="w-3.5 h-3.5 text-primary" /> Project Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group sm:col-span-2">
                                    <label>Project Name</label>
                                    <input name="project_name" defaultValue={getInit('project_name')} placeholder="e.g. Runwal Symphony" />
                                </div>
                                <div className="form-group">
                                    <label>Developer</label>
                                    <input name="developer" defaultValue={getInit('developer')} placeholder="e.g. Runwal Developers" />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input name="location" list="locationOptions" className="pl-8 w-full" defaultValue={getInit('location')} placeholder="e.g. Borivali" />
                                    </div>
                                </div>
                                <div className="form-group sm:col-span-2">
                                    <label>Configuration</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] text-slate-400 font-bold text-center">GR</span>
                                            <input name="ground" defaultValue={getInit('ground')} placeholder="Y/N" className="text-center px-1" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] text-slate-400 font-bold text-center">STILT</span>
                                            <input name="stilt" defaultValue={getInit('stilt')} placeholder="Y/N" className="text-center px-1" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] text-slate-400 font-bold text-center">BASE</span>
                                            <input name="basement" defaultValue={getInit('basement')} placeholder="Y/N" className="text-center px-1" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] text-slate-400 font-bold text-center">WINGS</span>
                                            <input name="wings" defaultValue={getInit('wings')} placeholder="Qty" className="text-center px-1" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] text-slate-400 font-bold text-center">FLOOR</span>
                                            <input name="floors" defaultValue={getInit('floors')} placeholder="Qty" className="text-center px-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Const. Status</label>
                                    <input name="const_status" list="constStatusOptions" defaultValue={getInit('const_status')} placeholder="e.g. Completed" />
                                </div>
                                <div className="form-group">
                                    <label>RERA Number</label>
                                    <div className="relative">
                                        <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input name="rera_no" className="pl-8 w-full" defaultValue={getInit('rera_no')} placeholder="e.g. P518000..." />
                                    </div>
                                </div>
                                <div className="form-group sm:col-span-2">
                                    <label>Google Maps Location</label>
                                    <div className="relative">
                                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input name="google_maps_link" className="pl-8 w-full" defaultValue={getInit('google_maps_link')} placeholder="Paste Google Maps Link here..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Contact Persons */}
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 pb-2 mb-4 flex items-center gap-2 border-b border-slate-200/60">
                                <User className="w-3.5 h-3.5 text-primary" /> Key Contacts
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group sm:col-span-2">
                                    <label>Owner Name</label>
                                    <input name="owner_name" defaultValue={getInit('owner_name')} placeholder="e.g. Sandeep Runwal" />
                                </div>
                                <div className="form-group">
                                    <label>Finalizing Authority Name</label>
                                    <input name="finalizing_authority_name" defaultValue={getInit('finalizing_authority_name')} placeholder="e.g. Manisha Thakur" />
                                </div>
                                <div className="form-group">
                                    <label>Finalizing Authority No.</label>
                                    <input name="finalizing_authority_number" defaultValue={getInit('finalizing_authority_number')} placeholder="e.g. +91 98..." />
                                </div>
                                <div className="form-group">
                                    <label>Site Incharge Name</label>
                                    <input name="site_incharge_name" defaultValue={getInit('site_incharge_name')} placeholder="e.g. Mr. Sameer Patil" />
                                </div>
                                <div className="form-group">
                                    <label>Site Incharge Number</label>
                                    <input name="site_incharge_number" defaultValue={getInit('site_incharge_number')} placeholder="e.g. +91 97..." />
                                </div>
                                <div className="form-group sm:col-span-2">
                                    <label>Architect</label>
                                    <input name="architect" defaultValue={getInit('architect')} placeholder="e.g. Vivek Bhole" />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Remarks */}
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 pb-2 mb-4 flex items-center gap-2 border-b border-slate-200/60">
                                <FileText className="w-3.5 h-3.5 text-primary" /> Additional Information
                            </h3>
                            <div className="form-group">
                                <label>Remarks</label>
                                <textarea name="remarks" defaultValue={getInit('remarks')} rows={2} placeholder="Additional notes..." className="w-full" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 items-center">
                    <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="lead-form"
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (initialData ? 'Update Lead' : 'Save Lead')}
                    </button>
                </div>

                <datalist id="sourceOptions">
                    <option value="WOM" /><option value="Referral" /><option value="Justdial" /><option value="Website" />
                </datalist>
                <datalist id="stageOptions">
                    <option value="qualified" /><option value="incoming" /><option value="quoted" /><option value="Win" /><option value="Lost" />
                </datalist>
                <datalist id="categoryOptions">
                    <option value="HOT" /><option value="Warm" /><option value="Cold" />
                </datalist>
                <datalist id="locationOptions">
                    <option value="Borivali" /><option value="Kandivali" /><option value="Malad" /><option value="Goregaon" /><option value="Andheri" />
                </datalist>
                <datalist id="constStatusOptions">
                    <option value="Structure" /><option value="Beam" /><option value="Slab" /><option value="Finishing" /><option value="Completed" />
                </datalist>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .modal-content {
                    background: #ffffff; border-radius: 1.5rem;
                    width: 100%; max-width: 800px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .form-group { display: flex; flex-direction: column; gap: 3px; }
                label { font-size: 9px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; }
                input, select, textarea {
                    padding: 7px 10px; background: #fff;
                    border: 1px solid #e2e8f0; border-radius: 10px;
                    color: #0f172a; font-size: 13px; outline: none;
                    transition: all 0.2s;
                }
                input:focus, textarea:focus { border-color: #e11d48; background: #fff; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1); }
                input::placeholder { color: #cbd5e1; font-size: 11px; }
            `}</style>
        </div>
    )
}
