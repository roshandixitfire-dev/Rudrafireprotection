'use client'

import React, { useState, useEffect } from 'react'
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ShieldCheck,
    FileText,
    History,
    Map as MapIcon,
    Package,
    CreditCard,
    Plus,
    ChevronRight,
    Droplets,
    Bell,
    MessageSquare,
    MoreVertical,
    Activity,
    BadgeCent
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { addSiteAction, getSitesAction } from '@/app/dashboard/clients/actions'
import { Save, X } from 'lucide-react'

interface Client360ViewProps {
    client: any
    accessLevel: string
}

export default function Client360View({ client, accessLevel }: Client360ViewProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'assets' | 'financials'>('overview')
    const [sites, setSites] = useState<any[]>([])
    const [isAddSiteOpen, setIsAddSiteOpen] = useState(false)
    const [loadingSites, setLoadingSites] = useState(true)

    const fetchSites = async () => {
        const result = await getSitesAction(Number(client.id))
        if (result.success) {
            setSites(result.data || [])
        }
        setLoadingSites(false)
    }

    useEffect(() => {
        fetchSites()
    }, [client.id])

    const handleCreateQuote = () => {
        router.push(`/dashboard/sales?clientId=${client.id}&create=true`)
    }

    const handleScheduleService = () => {
        router.push(`/dashboard/team/schedule?clientId=${client.id}`)
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'sites', label: 'Sites & Locations', icon: MapIcon },
        { id: 'assets', label: 'Asset Inventory', icon: Package },
        { id: 'financials', label: 'AMCs & Financials', icon: BadgeCent },
    ]

    // Dynamic Assets from client record
    const assetList = [
        { name: 'Hydrant Valves', count: client.hydrant_valve_count, capacity: client.hydrant_valve_type, site: 'Main Site' },
        { name: 'Hose Reel Drums', count: client.hosreel_drum_count, capacity: 'Standard', site: 'Main Site' },
        { name: 'Courtyard Hydrants', count: client.courtyard_hydrant_valve_count, capacity: client.courtyard_hydrant_valve_type, site: 'Main Site' },
        { name: 'Hose Boxes', count: client.hosebox_count, capacity: client.hosebox_type, site: 'Main Site' },
        { name: 'Canvas Hosepipes', count: client.canvas_hosepipe_count, capacity: 'Standard', site: 'Main Site' },
        { name: 'Short Branch Pipes', count: client.short_branch_pipes, capacity: 'Standard', site: 'Main Site' },
        { name: 'ABC Extinguishers', count: client.fire_extinguisher_abc, capacity: '6kg', site: 'Main Site' },
        { name: 'CO2 Extinguishers', count: client.fire_extinguisher_co2, capacity: '4.5kg', site: 'Main Site' },
        { name: 'Clean Agent', count: client.fire_extinguisher_clean_agent, capacity: '2kg', site: 'Main Site' },
        { name: 'Hydrant Pump', count: client.pump_hydrant, capacity: 'Main', site: 'Pump Room' },
        { name: 'Sprinkler Pump', count: client.pump_sprinkler, capacity: 'Main', site: 'Pump Room' },
    ].filter(a => a.count && a.count > 0)

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Back Button & Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium text-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to All Clients
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border border-primary/20">
                            {client.name?.charAt(0)}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{client.name || 'Unnamed Client'}</h1>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                                    {client.status || 'Active'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm">
                                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {client.address || 'No Address Provided'}</div>
                                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> +91-XXXXXXXXXX</div>
                                <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> contact@example.com</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="group relative">
                        <button className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-xl active:scale-95">
                            Quick Actions
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            <button
                                onClick={handleCreateQuote}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
                            >
                                <FileText className="w-4 h-4" /> Create Quote
                            </button>
                            <button
                                onClick={handleScheduleService}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 border-t border-slate-50"
                            >
                                <Calendar className="w-4 h-4" /> Schedule Service
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Layout */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
                {/* Sidebar/Top Tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-8 py-5 text-sm font-bold transition-all relative ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-primary to-orange-600 p-6 rounded-[1.5rem] text-white space-y-2 shadow-lg shadow-primary/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider relative z-10">Active AMC Value</p>
                                    <p className="text-3xl font-black italic relative z-10">₹{(Number(client.contract_value) || 0).toLocaleString()}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-medium bg-black/10 w-fit px-2 py-1 rounded-lg relative z-10">
                                        <ShieldCheck className="w-3 h-3" /> Ends: {client.amc_end_date || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-slate-50 p-6 rounded-[1.5rem] space-y-2 relative group">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Service Deadline</p>
                                    <p className="text-3xl font-black text-slate-800 italic">{client.next_service || 'N/A'}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold bg-amber-50 w-fit px-2 py-1 rounded-lg border border-amber-100 uppercase tracking-tighter">
                                        <Bell className="w-3 h-3" /> Action Required Soon
                                    </div>
                                    <button
                                        onClick={() => alert('Opening Edit Modal via Dashboard sync...')}
                                        className="absolute top-4 right-4 p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-all border border-slate-100"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="bg-white border-2 border-slate-50 p-6 rounded-[1.5rem] space-y-2 relative group">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Refilling Due</p>
                                    <p className="text-3xl font-black text-slate-800 italic">{client.next_refilling || 'N/A'}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-primary/50 font-bold bg-slate-50 w-fit px-2 py-1 rounded-lg uppercase tracking-tighter">
                                        <Droplets className="w-3 h-3" /> Scheduled next month
                                    </div>
                                    <button
                                        onClick={() => alert('Opening Edit Modal via Dashboard sync...')}
                                        className="absolute top-4 right-4 p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-all border border-slate-100"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                        CRM Communication Notes
                                    </h3>
                                    <button className="text-primary text-xs font-bold hover:underline">+ Add Note</button>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2].map((note) => (
                                        <div key={note} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100">
                                                <History className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800 text-sm">System Admin</span>
                                                    <span className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">Feb 20, 2025</span>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed italic">
                                                    Called client regarding the upcoming AMC renewal. They requested a revised quote for the new warehouse site in Bhiwandi.
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sites Tab */}
                    {activeTab === 'sites' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Physical Locations</h3>
                                    <p className="text-slate-400 text-sm italic">All associated properties and service sites</p>
                                </div>
                                <button
                                    onClick={() => setIsAddSiteOpen(true)}
                                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs transition-all hover:bg-primary/90 shadow-lg shadow-primary/10 hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" /> Add New Site
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sites.length === 0 && !loadingSites ? (
                                    <div className="col-span-full py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                        <MapPin className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="font-bold italic">No additional sites registered</p>
                                        <p className="text-[10px]">Primary address: {client.address}</p>
                                    </div>
                                ) : (
                                    sites.map((site: any) => (
                                        <div key={site.id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 hover:shadow-xl transition-all group flex justify-between items-start cursor-default">
                                            <div className="space-y-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <MapIcon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-slate-900">{site.name}</h4>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 leading-relaxed">
                                                        <MapPin className="w-3 h-3 text-slate-300 flex-shrink-0" /> {site.address}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest bg-slate-50 px-2 py-1 rounded italic">{site.site_type || 'Standard'}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Assets Tab */}
                    {activeTab === 'assets' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Asset Inventory</h3>
                                    <p className="text-slate-400 text-sm italic">Detailed register of equipment across sites</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest italic">Asset Class</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest italic">Location</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest italic">Specs / Type</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest italic text-right">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {assetList.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No assets registered in client profile.</td>
                                            </tr>
                                        ) : (
                                            assetList.map((asset: any, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-800 text-sm flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                        {asset.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{asset.site}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 font-bold uppercase tracking-tighter">{asset.capacity}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-lg font-black text-slate-900 italic">{asset.count}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Financials Tab */}
                    {activeTab === 'financials' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900 p-8 rounded-[2.5rem] space-y-4 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic relative z-10">Lifetime Value</p>
                                    <div className="space-y-1 relative z-10">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-tight">Total Billed Amt</h4>
                                        <span className="text-4xl font-black italic">₹{(Number(client.contract_value) || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden relative z-10">
                                        <div className="bg-primary h-full w-full" />
                                    </div>
                                    <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-2 uppercase tracking-tighter relative z-10">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Direct to client billing
                                    </p>
                                </div>
                                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">AMC Coverage</p>
                                        <h4 className="text-xl font-black text-slate-800 italic underline decoration-primary/20 decoration-4">Active Plan: {client.service_plan || 'Standard'}</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Start Date</p>
                                            <p className="text-xs font-bold text-slate-700">{client.amc_start_date || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Expiry Date</p>
                                            <p className="text-xs font-bold text-primary">{client.amc_end_date || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 italic">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Recent Invoices & Quotations
                                </h3>
                                <div className="space-y-2">
                                    {[1, 2, 3].map((inv) => (
                                        <div key={inv} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 tracking-tight">INV-2025-00{inv}</p>
                                                    <p className="text-[10px] text-slate-400 italic">Issued on Feb 1{inv}, 2025</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">₹12,450</p>
                                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Paid</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
