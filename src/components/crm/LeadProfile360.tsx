'use client'

import { useState } from 'react'
import {
    User, MapPin, Calendar, Building2, Phone, Mail, FileText,
    Activity, Clock, Send, MessageSquare, Target, ShieldCheck, CheckCircle2, X, UserPlus, ArrowRight
} from 'lucide-react'
import { convertLeadToClientAction } from '@/app/dashboard/crm/actions'

interface LeadProfile360Props {
    lead: any
    onClose: () => void
    onSendThankYou?: () => void
}

export default function LeadProfile360({ lead, onClose, onSendThankYou }: LeadProfile360Props) {
    const isWon = lead?.stage?.toLowerCase() === 'win'
    const [emailSent, setEmailSent] = useState(false)
    const [isConverting, setIsConverting] = useState(false)
    const isConverted = lead?.remarks?.includes('Converted to Client ID')

    const handleSendEmail = () => {
        setEmailSent(true)
        if (onSendThankYou) onSendThankYou()
        setTimeout(() => alert("Thank you email sent successfully to " + (lead.email_id || lead.contact_person || 'Client') + "!"), 500)
    }

    const handleConvertToClient = async () => {
        if (!confirm('Are you sure you want to convert this lead to a Client? This will create a new entry in Client Master.')) return

        setIsConverting(true)
        try {
            const res = await convertLeadToClientAction(lead.id)
            if (res.success) {
                alert('Success! Lead converted to Client #' + res.clientId)
                onClose()
                window.location.href = `/dashboard/clients/${res.clientId}`
            } else {
                alert('Conversion failed: ' + res.error)
            }
        } catch (err: any) {
            alert('An error occurred: ' + err.message)
        } finally {
            setIsConverting(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content !p-0 overflow-hidden flex flex-col h-[90vh] w-[95vw] max-w-[1400px]" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                            <Building2 className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold tracking-tight m-0">{lead.project_name || 'Unnamed Project'}</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300 border border-white/10">
                                    {lead.category || 'COLD'}
                                </span>
                                {isWon && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> WON
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 flex items-center gap-4">
                                <span><MapPin className="w-3.5 h-3.5 inline mr-1 opacity-70" /> {lead.location || 'Unknown Location'}</span>
                                <span><User className="w-3.5 h-3.5 inline mr-1 opacity-70" /> {lead.developer || 'Unknown Developer'}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 360-Degree Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50">

                    {/* Left Column: Comprehensive Form Info */}
                    <div className="w-full md:w-1/3 border-r border-slate-200 bg-white overflow-y-auto p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" /> 360° Profile Detail
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-wider">Core Info</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                    <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Stage</span><span className="font-semibold text-slate-800">{lead.stage || '-'}</span></div>
                                    <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Source</span><span className="font-semibold text-slate-800">{lead.source || '-'}</span></div>
                                    <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Form No</span><span className="font-semibold text-slate-800">{lead.sales_form_no || '-'}</span></div>
                                    <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Date</span><span className="font-semibold text-slate-800">{lead.sales_form_date || '-'}</span></div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-wider">Project Specification</h4>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Configuration</span><span className="font-semibold text-slate-800">{lead.configuration || '-'}</span></div>
                                    <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Construction Status</span><span className="font-semibold text-slate-800">{lead.const_status || '-'}</span></div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-wider">Key Contacts</h4>
                                <div className="space-y-3 text-sm">
                                    {lead.owner_name && <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Owner</span><span className="font-semibold text-slate-800">{lead.owner_name}</span></div>}
                                    {lead.finalizing_authority && <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Finalizing Authority</span><span className="font-semibold text-slate-800">{lead.finalizing_authority}</span></div>}
                                    {lead.site_incharge && <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Site Incharge</span><span className="font-semibold text-slate-800">{lead.site_incharge}</span></div>}
                                    {lead.architect && <div><span className="text-slate-400 block text-[10px] mb-0.5 uppercase">Architect</span><span className="font-semibold text-slate-800">{lead.architect}</span></div>}
                                </div>
                            </div>

                            {lead.remarks && (
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <h4 className="text-[10px] uppercase font-bold text-amber-600 mb-2 tracking-wider flex items-center gap-1"><FileText className="w-3 h-3" /> Remarks</h4>
                                    <p className="text-sm font-medium text-amber-900">{lead.remarks}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Column: Automation & Analytics */}
                    <div className="w-full md:w-1/3 border-r border-slate-200 overflow-y-auto p-6 bg-slate-50/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" /> Sales & Marketing Automation
                        </h3>

                        <div className="space-y-4">
                            {/* Thank you email module */}
                            {isWon ? (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1">Onboarding Setup Complete</h4>
                                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">This lead has been won. You can now automatically send the standard onboarding welcome & thank you email.</p>
                                    <button
                                        onClick={handleSendEmail}
                                        disabled={emailSent}
                                        className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${emailSent ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'}`}
                                    >
                                        {emailSent ? <><CheckCircle2 className="w-4 h-4" /> Email Sent</> : <><Send className="w-4 h-4" /> Send Thank You Email</>}
                                    </button>

                                    <div className="pt-2">
                                        <button
                                            onClick={handleConvertToClient}
                                            disabled={isConverting || isConverted}
                                            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isConverted ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
                                        >
                                            {isConverting ? 'Converting...' : isConverted ? <><CheckCircle2 className="w-4 h-4" /> Converted to Client</> : <><UserPlus className="w-4 h-4" /> Convert to Client Master</>}
                                        </button>
                                        {!isConverted && (
                                            <p className="text-[9px] text-center text-slate-400 mt-2 italic flex items-center justify-center gap-1">
                                                <ArrowRight className="w-3 h-3" /> Creates permanent client record
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 opacity-60">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1">Onboarding Email Pending</h4>
                                    <p className="text-xs text-slate-500">Convert this lead to WON to unlock automated onboarding emails.</p>
                                </div>
                            )}

                            {/* Marketing Workflows mock */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h4 className="font-bold text-slate-900 text-sm mb-4">Active Journeys</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><MessageSquare className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">Drip Campaign: Monthly Update</p>
                                                <p className="text-[10px] text-slate-500">Subscribed since form submission</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                                            <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600"><Target className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">Ad Retargeting</p>
                                                <p className="text-[10px] text-slate-500">Google Ads Segment</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-4 bg-orange-600 rounded-full relative">
                                            <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity Timeline */}
                    <div className="w-full md:w-1/3 bg-white overflow-y-auto p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" /> Activity Timeline
                        </h3>

                        <div className="relative border-l-2 border-slate-100 ml-3 pl-5 space-y-6">
                            {/* Dummy Timeline Data for Freshworks feel */}
                            <div className="relative">
                                <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                <p className="text-xs text-slate-400 mb-1">Today, 10:45 AM</p>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-sm font-bold text-slate-800">Viewed Profile</p>
                                    <p className="text-xs text-slate-500 mt-1">You opened the 360-degree view.</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                                <p className="text-xs text-slate-400 mb-1">2 days ago</p>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-sm font-bold text-slate-800">Stage Updated</p>
                                    <p className="text-xs text-slate-500 mt-1">Lead moved to <span className="font-bold">{lead.stage || 'NEW'}</span> stage.</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                <p className="text-xs text-slate-400 mb-1">{lead.sales_form_date || 'A few days ago'}</p>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-sm font-bold text-slate-800">Lead Created</p>
                                    <p className="text-xs text-slate-500 mt-1">Captured from {lead.source || 'Manual Entry'}.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .modal-content {
                    background: #ffffff; border-radius: 1.5rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    )
}
