'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Target, Users, Settings, Receipt, Package, FileText, Activity, Calendar, Clock, CheckCircle2, Plus, CalendarDays, Wrench, X, FileSignature, UserPlus, CalendarPlus } from 'lucide-react'
import * as LucideIcons from 'lucide-react'



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

// Mock data for Sales (Revenue)
const salesData = [
    { name: 'Jan', value: 120000 },
    { name: 'Feb', value: 150000 },
    { name: 'Mar', value: 180000 },
    { name: 'Apr', value: 140000 },
    { name: 'May', value: 220000 },
    { name: 'Jun', value: 280000 },
]

// Mock data for Services (Number of Jobs Completed)
const servicesData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 38 },
    { name: 'Apr', value: 65 },
    { name: 'May', value: 58 },
    { name: 'Jun', value: 72 },
]

export default function OdooDashboard({ activities = [], audits = [] }: { activities?: any[], audits?: any[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const [hasMounted, setHasMounted] = useState(false)
    const [selectedModule, setSelectedModule] = useState<string>('crm')
    const [dateRange, setDateRange] = useState<string>('7d')
    const [activeCard, setActiveCard] = useState('clients')
    const [isFabOpen, setIsFabOpen] = useState(false)

    // Quick Actions for FAB
    const quickActions = [
        { id: 'task', label: 'Add Task Schedule', icon: CalendarPlus, color: 'text-purple-600', bg: 'bg-purple-50', path: '/dashboard/team/schedule' },
        { id: 'service', label: 'Log Service', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50', path: '/dashboard/services' },
        { id: 'client', label: 'Add Client', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/dashboard/crm' },
        { id: 'lead', label: 'Add Lead', icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/dashboard/crm' },
        { id: 'invoice', label: 'New Invoice', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100', path: '/dashboard/invoices' },
        { id: 'quote', label: 'New Quote', icon: FileSignature, color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/dashboard/quotations' },
    ];

    useEffect(() => {
        setHasMounted(true)
    }, [])

    // Process dates only on the client or in a memoized way that is stable during hydration
    const processedActions = useMemo(() => {
        if (!hasMounted) return []
        
        const now = new Date().getTime()
        
        const pendingReminders = activities
            .filter(a => a.next_reminder_date && a.reminder_status !== 'Completed')
            .map(a => {
                const reminderDate = new Date(a.next_reminder_date).getTime()
                const diffDays = Math.ceil((reminderDate - now) / (1000 * 60 * 60 * 24))
                return {
                    id: `rem-${a.id}`,
                    text: `${a.reminder_type || 'Service'} Due: ${a.client_name}`,
                    date: diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `In ${diffDays} days (${(() => {
                        const d = new Date(a.next_reminder_date);
                        return isNaN(d.getTime()) ? '' : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                    })()})`,
                    type: diffDays <= 3 ? 'urgent' : diffDays <= 7 ? 'warning' : 'normal',
                    color: diffDays <= 3 ? 'bg-red-500' : diffDays <= 7 ? 'bg-orange-500' : 'bg-blue-500',
                    sortDate: reminderDate
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

        return [...pendingReminders, ...pendingAudits]
            .sort((a, b) => a.sortDate - b.sortDate)
            .slice(0, 5)
    }, [hasMounted, activities, audits])

    const processedActivities = useMemo(() => {
        if (!hasMounted) return []
        
        const now = new Date().getTime()
        
        const getTimeAgo = (date: string) => {
            const diff = now - new Date(date).getTime()
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

        return [...recentActivities, ...recentAudits]
            .sort((a, b) => b.sortDate - a.sortDate)
            .slice(0, 6)
    }, [hasMounted, activities, audits])

    if (!hasMounted) {
        return <div className="p-8 max-w-[1600px] mx-auto space-y-8 opacity-0">Loading Dashboard...</div>
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 relative">
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

            {/* KPI Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'clients', title: 'Active Clients', value: '84', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', path: '/dashboard/crm' },
                    { id: 'invoices', title: 'Pending Invoice', value: '₹4.5L', icon: FileText, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', path: '/dashboard/payments' },
                    { id: 'tasks', title: 'Task Schedule', value: '12', icon: CalendarDays, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', path: '/dashboard/team/schedule' },
                    { id: 'services', title: 'Service Due', value: '08', icon: Wrench, iconBg: 'bg-red-50', iconColor: 'text-red-600', path: '/dashboard/services' }
                ].map((card) => {
                    const Icon = card.icon;
                    // Check if current path starts with the card path to show as active
                    const isActive = pathname === card.path || (card.path !== '/dashboard' && pathname.startsWith(card.path));
                    return (
                        <button
                            key={card.id}
                            onClick={() => {
                                setActiveCard(card.id);
                                router.push(card.path);
                            }}
                            className={`
                                relative flex items-center justify-between p-6 bg-white rounded-2xl border text-left
                                transition-all duration-300 ease-in-out group cursor-pointer
                                hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-300
                                ${isActive ? 'border-red-500 shadow-md ring-1 ring-red-500' : 'border-slate-100 shadow-sm'}
                            `}
                        >
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    {card.title}
                                </p>
                                <h3 className="text-3xl font-bold text-slate-800">
                                    {card.value}
                                </h3>
                            </div>
                            
                            <div className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                                <Icon className="w-6 h-6" />
                            </div>

                            {isActive && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Performance Chart Section - Custom Tailwind Implementation */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                {/* Header & Toggle Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-900 m-0">Business Intelligence</h2>
                    </div>
                    
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setSelectedModule('crm')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300
                            ${selectedModule === 'crm' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sales
                        </button>
                        <button 
                            onClick={() => setSelectedModule('services')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300
                            ${selectedModule === 'services' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Services
                        </button>
                    </div>
                </div>

                {/* Custom Tailwind Bar Chart */}
                <div className="relative h-72 w-full flex items-end justify-between px-2 sm:px-8 mt-4 border-b border-slate-200 pb-2">
                    {/* Y-Axis Background Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="border-t border-slate-50 w-full h-0"></div>
                        ))}
                    </div>

                    {/* The Bars */}
                    {(selectedModule === 'crm' ? salesData : servicesData).map((item, index) => {
                        const currentData = selectedModule === 'crm' ? salesData : servicesData;
                        const maxValue = Math.max(...currentData.map(d => d.value));
                        const heightPercentage = (item.value / maxValue) * 100;
                        const barColor = selectedModule === 'crm' ? 'bg-red-600' : 'bg-slate-500';
                        const hoverColor = selectedModule === 'crm' ? 'hover:bg-red-700' : 'hover:bg-slate-600';

                        return (
                            <div key={index} className="relative flex flex-col items-center group z-10 w-full">
                                {/* Tooltip */}
                                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-800 text-white text-xs py-2 px-3 rounded-xl shadow-xl whitespace-nowrap pointer-events-none -translate-y-2 group-hover:translate-y-0">
                                    {selectedModule === 'crm' ? `₹${item.value/1000}k` : `${item.value} Jobs`}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                </div>

                                {/* The Bar */}
                                <div 
                                    className={`w-10 sm:w-14 rounded-t-lg transition-all duration-700 ease-in-out cursor-pointer ${barColor} ${hoverColor}`}
                                    style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                ></div>
                                
                                {/* X-Axis Label */}
                                <span className="absolute -bottom-8 text-xs font-bold text-slate-400">
                                    {item.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                {/* Spacer for X-axis labels */}
                <div className="h-10"></div>
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
                        {processedActions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                <CheckCircle2 className="w-8 h-8 opacity-50" />
                                <p className="font-medium text-sm">All caught up!</p>
                            </div>
                        ) : (
                            processedActions.map((action) => (
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
                        )}
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
                            {processedActivities.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8 font-medium">No recent activity</p>
                            ) : (
                                processedActivities.map((event) => (
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
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cascaded Quick Actions FAB */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
                {/* Actions Menu */}
                <div 
                    className={`flex flex-col items-end gap-3 mb-4 transition-all duration-300 origin-bottom 
                        ${isFabOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
                    `}
                >
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                style={{ transitionDelay: `${isFabOpen ? index * 50 : 0}ms` }}
                                className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-full shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-x-1 transition-all duration-300 group"
                                onClick={() => {
                                    router.push(action.path);
                                    setIsFabOpen(false);
                                }}
                            >
                                <span className="text-sm font-semibold text-slate-700">{action.label}</span>
                                <div className={`p-2 rounded-full ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                                    <Icon size={20} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Main Trigger Button */}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                    <div className={`transition-transform duration-300 ${isFabOpen ? 'rotate-[135deg]' : 'rotate-0'}`}>
                        {isFabOpen ? <X size={28} /> : <Plus size={28} />}
                    </div>
                </button>
            </div>
        </div>
    )
}

