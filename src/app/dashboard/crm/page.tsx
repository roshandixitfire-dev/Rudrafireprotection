'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import LeadMasterTable from '@/components/crm/LeadMasterTable'
import ClientMasterTable from '@/components/clients/ClientMasterTable'
import {
    Target,
    TrendingUp,
    Users,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Clock,
    Search,
    Plus,
    Download,
    History,
    List,
    LayoutGrid,
    ChevronRight,
    Home
} from 'lucide-react'
import { DEMO_LEADS, DEMO_CLIENTS } from '@/utils/demo-data'
import { BulkImportModal } from '@/components/clients/BulkImportModal'
import BulkImportLeadsModal from '@/components/crm/BulkImportLeadsModal'
import LeadForm from '@/components/crm/LeadForm'
import ClientForm from '@/components/ClientForm'
import CRMAnalytics from '@/components/crm/CRMAnalytics'
import { AuditLogsModal } from '@/components/ui/AuditLogsModal'
import Link from 'next/link'
import RightSidebar from '@/components/RightSidebar'
import { deleteClientAction } from '@/app/dashboard/clients/actions'

function CRMPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tabParam = searchParams.get('tab') as 'leads' | 'clients' | 'analytics' | null

    const [leads, setLeads] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)
    const [isDemo, setIsDemo] = useState(false)
    const [activeTab, setActiveTab] = useState<'leads' | 'clients' | 'analytics'>(tabParam || 'leads')
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
    const [editingClient, setEditingClient] = useState<any>(null)
    const [isAddingClient, setIsAddingClient] = useState(false)

    // Sync state with URL if it changes externally
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    const handleTabChange = (newTab: 'leads' | 'clients' | 'analytics') => {
        setActiveTab(newTab)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', newTab)
        router.replace(`?${params.toString()}`, { scroll: false })
    }

    // Unified Toolbar State
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

    // Unified Modal States
    const [isLeadFormOpen, setIsLeadFormOpen] = useState(false)
    const [isBulkImportLeadsOpen, setIsBulkImportLeadsOpen] = useState(false)
    const [isBulkImportClientsOpen, setIsBulkImportClientsOpen] = useState(false)
    const [isAuditLogOpen, setIsAuditLogOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const supabase = createClient()

                const [leadsResult, clientsResult] = await Promise.all([
                    supabase.from('leads').select('*').order('sr_no', { ascending: true }),
                    supabase.from('clients').select('*').order('created_at', { ascending: false })
                ])

                if (leadsResult?.error) throw leadsResult.error
                if (clientsResult?.error) throw clientsResult.error

                setLeads(leadsResult?.data || [])
                setClients(clientsResult?.data || [])
                setIsDemo(false)
            } catch (e: any) {
                console.warn('Fetch Failed:', e.message)
                setError(e)
                setLeads(DEMO_LEADS)
                setClients(DEMO_CLIENTS)
                setIsDemo(true)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleDeleteClient = async (id: string | number) => {
        if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            const result = await deleteClientAction(Number(id))
            if (result.success) {
                setClients(prev => prev.filter(client => Number(client.id) !== Number(id)))
            } else {
                alert('Failed to delete: ' + (result.error || 'Unknown error'))
            }
        }
    }

    const leadStats = [
        { label: 'ALL LEADS', value: leads.length, bg: 'bg-slate-50', dot: 'bg-slate-400', color: 'text-slate-600' },
        { label: 'QUOTED', value: leads.filter((l: any) => l.stage?.toLowerCase() === 'quoted').length, bg: 'bg-blue-50/50', dot: 'bg-blue-500', color: 'text-blue-600' },
        { label: 'WON', value: leads.filter((l: any) => l.stage?.toLowerCase() === 'win').length, bg: 'bg-emerald-50/50', dot: 'bg-emerald-500', color: 'text-emerald-600' },
    ]

    const clientStats = [
        { label: 'ALL CLIENTS', value: clients.length, bg: 'bg-slate-50', dot: 'bg-slate-400', color: 'text-slate-600' },
        { label: 'ACTIVE', value: clients.filter((c: any) => c.status?.toLowerCase() === 'active').length, bg: 'bg-emerald-50/50', dot: 'bg-emerald-500', color: 'text-emerald-600' },
        { label: 'STD BY', value: clients.filter((c: any) => c.status?.toLowerCase() !== 'active').length, bg: 'bg-amber-50/50', dot: 'bg-amber-500', color: 'text-amber-600' },
    ]

    const statsToDisplay = activeTab === 'leads' ? leadStats : clientStats

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isRightSidebarOpen ? 'mr-[260px]' : 'mr-[78px]'}`}>
                <div className="p-0 md:p-2 pb-20">
                    {/* Progress / Breadcrumbs */}
                    <div className="flex items-center gap-2 px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Link href="/dashboard" className="hover:text-primary flex items-center gap-1 transition-colors">
                            <Home className="w-3 h-3" /> Home
                        </Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-900 border-b border-primary/30 pb-0.5">CRM Dashboard</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary">{activeTab === 'leads' ? 'Leads & Inquiries' : activeTab === 'clients' ? 'Clients Master' : 'Analytics'}</span>
                    </div>

                    {isDemo && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-700 font-medium">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                <p>Network issue detected. Using fallback demo data. Your live data is safe in the database but currently unreachable.</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-xl text-xs font-bold transition-colors"
                            >
                                Retry Connection
                            </button>
                        </div>
                    )}

                    {error && !isDemo && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 font-medium mb-6">
                            <AlertCircle className="w-5 h-5" />
                            <p>Failed to load data. Please check your connection or refresh the page. (Error: {error.message})</p>
                        </div>
                    )}

                    <div className="bg-white rounded-t-2xl shadow-sm border border-slate-100 overflow-hidden mt-2">
                        <div className="flex border-b border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => handleTabChange('leads')}
                                className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2 ${activeTab === 'leads' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            >
                                Leads & Inquiries
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'leads' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                                    {leads.length}
                                </span>
                            </button>
                            <button
                                onClick={() => handleTabChange('clients')}
                                className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2 ${activeTab === 'clients' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            >
                                All Clients Master
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'clients' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                                    {clients.length}
                                </span>
                            </button>
                            <button
                                onClick={() => handleTabChange('analytics')}
                                className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2 ${activeTab === 'analytics' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            >
                                Analytics
                            </button>
                        </div>

                        <div className="p-3 flex items-center justify-between bg-white flex-wrap gap-3">
                            <div className="relative group w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="search"
                                    placeholder={`Search ${activeTab === 'leads' ? 'leads' : 'clients'}...`}
                                    className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => activeTab === 'leads' ? setIsBulkImportLeadsOpen(true) : setIsBulkImportClientsOpen(true)}
                                    className="flex items-center justify-center gap-1.5 px-3 h-9 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="hidden md:inline">Bulk Import</span>
                                </button>

                                <button
                                    onClick={() => {
                                        if (activeTab === 'leads') {
                                            setIsLeadFormOpen(true)
                                        } else {
                                            setIsAddingClient(true)
                                        }
                                    }}
                                    className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3 h-9 rounded-lg font-bold text-xs transition-all shadow-sm whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add {activeTab === 'leads' ? 'Lead' : 'Client'}</span>
                                </button>

                                <div className={`flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 h-9 transition-opacity ${activeTab !== 'analytics' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-2 h-full rounded transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-2 h-full rounded transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsAuditLogOpen(true)}
                                    className="flex items-center justify-center w-9 h-9 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-indigo-500 transition-all shadow-sm hidden md:flex"
                                    title="Data Audit Logs"
                                >
                                    <History className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-slate-500 font-bold">Connecting to Database...</p>
                        </div>
                    ) : (
                        <div className="transition-all duration-300 bg-white border border-slate-100 border-t-0 rounded-b-2xl shadow-sm overflow-hidden">
                            {activeTab === 'analytics' ? (
                                <CRMAnalytics leads={leads} clients={clients} />
                            ) : activeTab === 'leads' ? (
                                <LeadMasterTable
                                    leads={leads}
                                    hideToolbar={true}
                                    externalSearchTerm={searchTerm}
                                    externalViewMode={viewMode}
                                />
                            ) : (
                                <ClientMasterTable
                                    title="All Clients Master"
                                    data={clients}
                                    accessLevel="full"
                                    hideToolbar={true}
                                    externalSearchTerm={searchTerm}
                                    externalViewMode={viewMode}
                                    onDelete={handleDeleteClient}
                                    onEdit={(client) => setEditingClient(client)}
                                    onAdd={() => setIsAddingClient(true)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <RightSidebar
                title="System Activity"
                isOpen={isRightSidebarOpen}
                onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            >
                <div className="space-y-6 overflow-visible">
                    <div className={`${isRightSidebarOpen ? 'bg-slate-50/50 p-4' : 'bg-transparent p-0 overflow-visible'} rounded-2xl border ${isRightSidebarOpen ? 'border-slate-100' : 'border-transparent'} shadow-sm transition-all`}>
                        {isRightSidebarOpen && (
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metrics Overview</span>
                                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            </div>
                        )}

                        {!isRightSidebarOpen && (
                            <div className="flex flex-col items-center mb-4 gap-4 relative group overflow-visible">
                                <TrendingUp className="w-5 h-5 text-primary cursor-help" />
                                <div className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[1000] shadow-2xl translate-x-3 group-hover:translate-x-0 border border-slate-700/50">
                                    Metrics Overview
                                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-t border-slate-700/50" />
                                </div>
                                <div className="w-full h-px bg-slate-100" />
                            </div>
                        )}

                        <div className={`grid ${isRightSidebarOpen ? 'gap-3' : 'gap-4'}`}>
                            {statsToDisplay.map((stat, i) => (
                                <div
                                    key={i}
                                    className={`relative group ${stat.bg} rounded-xl ${isRightSidebarOpen ? 'p-3' : 'p-2'} border border-white shadow-sm hover:shadow-md transition-all flex flex-col ${isRightSidebarOpen ? 'items-start' : 'items-center'} justify-center overflow-visible`}
                                >
                                    {!isRightSidebarOpen && (
                                        <div className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[1000] shadow-2xl translate-x-3 group-hover:translate-x-0 border border-slate-700/50">
                                            {stat.label}
                                            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-t border-slate-700/50" />
                                        </div>
                                    )}
                                    {isRightSidebarOpen && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                                            <span className={`text-[10px] font-bold tracking-wider uppercase ${stat.color}`}>{stat.label}</span>
                                        </div>
                                    )}
                                    <span className={`${isRightSidebarOpen ? 'text-2xl' : 'text-xl'} font-black text-slate-800 tracking-tight`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition-all overflow-visible ${isRightSidebarOpen ? 'p-4' : 'p-2 flex flex-col items-center'}`}>
                        <div className={`flex items-center gap-2 text-slate-800 relative group ${isRightSidebarOpen ? 'mb-4' : 'mb-2'}`}>
                            <Clock className={`text-primary ${isRightSidebarOpen ? 'w-4 h-4' : 'w-5 h-5 cursor-help'}`} />
                            {!isRightSidebarOpen && (
                                <div className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[1000] shadow-2xl translate-x-3 group-hover:translate-x-0 border border-slate-700/50">
                                    Recent Activity
                                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-t border-slate-700/50" />
                                </div>
                            )}
                            {isRightSidebarOpen && <span className="font-bold text-xs">Recent Activity</span>}
                        </div>
                        {isRightSidebarOpen ? (
                            <div className="space-y-3">
                                <div className="text-[10px] text-slate-500 p-2 bg-slate-50 rounded-lg">
                                    No recent updates to show
                                </div>
                                <button className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase hover:bg-slate-800 transition-colors">
                                    View History
                                </button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <button
                                    onClick={() => setIsAuditLogOpen(true)}
                                    className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    <History className="w-4 h-4" />
                                </button>
                                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[1000] shadow-2xl translate-x-3 group-hover:translate-x-0 border border-slate-700/50">
                                    View History
                                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-t border-slate-700/50" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </RightSidebar>

            {isLeadFormOpen && (
                <LeadForm
                    onClose={() => setIsLeadFormOpen(false)}
                    initialData={null}
                />
            )}

            {(isAddingClient || editingClient) && (
                <ClientForm
                    onClose={() => {
                        setIsAddingClient(false)
                        setEditingClient(null)
                    }}
                    initialData={editingClient}
                />
            )}

            <BulkImportLeadsModal
                isOpen={isBulkImportLeadsOpen}
                onClose={() => setIsBulkImportLeadsOpen(false)}
            />

            <BulkImportModal
                isOpen={isBulkImportClientsOpen}
                onClose={() => setIsBulkImportClientsOpen(false)}
                onSuccess={(count) => {
                    console.log(`Successfully imported ${count} clients`)
                    window.location.reload()
                }}
            />

            <AuditLogsModal
                isOpen={isAuditLogOpen}
                tableName={activeTab === 'leads' ? "leads" : "clients"}
                title={`${activeTab === 'leads' ? 'Lead' : 'Client'} Master`}
                onClose={() => setIsAuditLogOpen(false)}
                onRestored={() => window.location.reload()}
            />
        </div>
    )
}

export default function SuspendedCRMPage() {
    return (
        <Suspense fallback={
            <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 font-bold">Loading CRM Module...</p>
            </div>
        }>
            <CRMPageContent />
        </Suspense>
    )
}
