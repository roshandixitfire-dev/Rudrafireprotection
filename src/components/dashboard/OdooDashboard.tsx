'use client'

import { useState } from 'react'
import { Target, Users, Settings, Receipt, Package, FileText, Activity, Calendar, Clock, CheckCircle2 } from 'lucide-react'

// Using dynamic import if Recharts causes SSR issues, but for now standard imports
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'

interface ModuleOption {
    id: string
    title: string
    subtitle: string
    icon: any
    color: string
    bgColor: string
}

const MODULES: ModuleOption[] = [
    { id: 'crm', title: 'Sales CRM', subtitle: 'Track leads & opportunities', icon: Target, color: '#e11d48', bgColor: '#fff1f2' },
    { id: 'clients', title: 'Clients Master', subtitle: 'Manage active clients', icon: Users, color: '#4f46e5', bgColor: '#eef2ff' },
    { id: 'assets', title: 'Asset Tracking', subtitle: 'View physical inventory', icon: Package, color: '#0ea5e9', bgColor: '#f0f9ff' },
    { id: 'invoicing', title: 'Invoicing', subtitle: 'Billing & Payments', icon: Receipt, color: '#10b981', bgColor: '#ecfdf5' },
    { id: 'reports', title: 'Reports', subtitle: 'Generated documents', icon: FileText, color: '#8b5cf6', bgColor: '#f5f3ff' },
]

// Mock data for the charts
const mockDataCRM = [
    { date: 'Mon', leads: 4, won: 1 },
    { date: 'Tue', leads: 7, won: 2 },
    { date: 'Wed', leads: 5, won: 0 },
    { date: 'Thu', leads: 8, won: 3 },
    { date: 'Fri', leads: 12, won: 4 },
    { date: 'Sat', leads: 3, won: 1 },
    { date: 'Sun', leads: 2, won: 0 },
]

export default function OdooDashboard({ activities = [], audits = [] }: { activities?: any[], audits?: any[] }) {
    const [selectedModule, setSelectedModule] = useState<string>('crm')
    const [dateRange, setDateRange] = useState<string>('7d')

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Date Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 m-0">Performance Dashboard</h1>
                        <p className="text-sm text-slate-500 m-0">Select a module to view key metrics</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                    <button
                        onClick={() => setDateRange('7d')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${dateRange === '7d' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setDateRange('30d')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${dateRange === '30d' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setDateRange('all')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${dateRange === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Calendar className="w-4 h-4" />
                        Custom
                    </button>
                </div>
            </div>

            {/* Odoo-Style App Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {MODULES.map((mod) => (
                    <button
                        key={mod.id}
                        onClick={() => setSelectedModule(mod.id)}
                        className={`flex flex-col p-5 rounded-2xl border text-left transition-all group hover:shadow-md ${selectedModule === mod.id
                            ? 'bg-white border-slate-300 ring-2 ring-primary/20 shadow-sm transform scale-[1.02]'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm"
                            style={{ backgroundColor: mod.bgColor, color: mod.color }}
                        >
                            <mod.icon className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg tracking-tight mb-1">{mod.title}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{mod.subtitle}</p>
                    </button>
                ))}
            </div>

            {/* Performance Chart Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[400px]">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-6 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold text-slate-900 m-0">
                        {MODULES.find(m => m.id === selectedModule)?.title} Overview
                    </h2>
                </div>

                <div className="flex-1 w-full relative">
                    {selectedModule === 'crm' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockDataCRM} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                />
                                <Bar dataKey="leads" name="New Leads" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="won" name="Won Projects" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Activity className="w-12 h-12 opacity-50" />
                            <p className="font-medium text-sm">More metrics for this module coming soon.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Immediate Actions */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[320px]">
                    <div className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 m-0 text-left">Immediate Actions</h2>
                            <p className="text-sm text-slate-500 m-0">Tasks requiring your attention</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {(() => {
                            const pendingReminders = activities
                                .filter(a => a.next_reminder_date && a.reminder_status !== 'Completed')
                                .map(a => {
                                    const diffDays = Math.ceil((new Date(a.next_reminder_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                    return {
                                        id: `rem-${a.id}`,
                                        text: `${a.reminder_type || 'Service'} Due: ${a.client_name}`,
                                        date: diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `In ${diffDays} days (${(() => {
                                            const d = new Date(a.next_reminder_date);
                                            return isNaN(d.getTime()) ? '' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                        })()})`,
                                        type: diffDays <= 3 ? 'urgent' : diffDays <= 7 ? 'warning' : 'normal',
                                        color: diffDays <= 3 ? 'bg-red-500' : diffDays <= 7 ? 'bg-orange-500' : 'bg-blue-500',
                                        sortDate: new Date(a.next_reminder_date).getTime()
                                    }
                                })

                            const pendingAudits = audits
                                .filter(a => a.status === 'Needs Review' || a.status === 'Draft')
                                .map(a => ({
                                    id: `aud-${a.id}`,
                                    text: `Audit ${a.status}: ${a.client_name}`,
                                    date: (() => {
                                        const d = new Date(a.report_date);
                                        return isNaN(d.getTime()) ? 'N/A' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                    })(),
                                    type: a.status === 'Needs Review' ? 'warning' : 'normal',
                                    color: a.status === 'Needs Review' ? 'bg-amber-500' : 'bg-slate-500',
                                    sortDate: new Date(a.report_date).getTime()
                                }))

                            const actions = [...pendingReminders, ...pendingAudits]
                                .sort((a, b) => a.sortDate - b.sortDate)
                                .slice(0, 5)

                            if (actions.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                        <CheckCircle2 className="w-8 h-8 opacity-50" />
                                        <p className="font-medium text-sm">All caught up!</p>
                                    </div>
                                )
                            }

                            return actions.map((action) => (
                                <div key={action.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${action.color} shadow-sm`} />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-left text-sm">{action.text}</h4>
                                        <p className="text-xs text-slate-500 text-left flex items-center gap-1 mt-1 font-medium">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {action.date}
                                        </p>
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[320px]">
                    <div className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 m-0 text-left">Recent Activity</h2>
                            <p className="text-sm text-slate-500 m-0">Latest system events</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 relative">
                        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-100 z-0" />

                        <div className="space-y-6 relative z-10">
                            {(() => {
                                const getTimeAgo = (date: string) => {
                                    const diff = new Date().getTime() - new Date(date).getTime()
                                    const hours = Math.floor(diff / (1000 * 60 * 60))
                                    if (hours < 24) return hours <= 0 ? 'Just now' : `${hours} hours ago`
                                    const days = Math.floor(hours / 24)
                                    return days === 1 ? 'Yesterday' : `${days} days ago`
                                }

                                const recentActivities = activities.map(a => ({
                                    id: `act-${a.id}`,
                                    text: `${a.activity_type} - ${a.client_name}`,
                                    time: getTimeAgo(a.activity_date),
                                    sortDate: new Date(a.activity_date).getTime(),
                                    icon: Activity
                                }))

                                const recentAudits = audits.map(a => ({
                                    id: `aud-${a.id}`,
                                    text: `Audit saved for ${a.client_name} (${a.status})`,
                                    time: getTimeAgo(a.created_at || a.report_date),
                                    sortDate: new Date(a.created_at || a.report_date).getTime(),
                                    icon: FileText
                                }))

                                const allRecent = [...recentActivities, ...recentAudits]
                                    .sort((a, b) => b.sortDate - a.sortDate)
                                    .slice(0, 6)

                                if (allRecent.length === 0) {
                                    return <p className="text-sm text-slate-400 text-center py-8 font-medium">No recent activity</p>
                                }

                                return allRecent.map((event) => (
                                    <div key={event.id} className="flex items-start gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors shrink-0 shadow-sm relative z-10">
                                            <event.icon className="w-4 h-4" />
                                        </div>
                                        <div className="pt-1 flex-1">
                                            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors text-left">{event.text}</h4>
                                            <p className="text-xs text-slate-400 font-medium mt-1 text-left">{event.time}</p>
                                        </div>
                                    </div>
                                ))
                            })()}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
