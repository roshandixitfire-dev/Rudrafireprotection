'use client'

import { useState } from 'react'
import ServiceRecordsTable from './ServiceRecordsTable'
import ActivitiesClientView from '@/app/dashboard/activities/ActivitiesClientView'
import AuditReportsTable from './AuditReportsTable'
import AuditReportForm from './AuditReportForm'
import { BulkImportAuditReportsModal } from './BulkImportAuditReportsModal'
import { Wrench, Clock } from 'lucide-react'
import { AccessLevel } from '@/utils/supabase/demo-users'

interface Props {
    servicesData: any[]
    activitiesData: any[]
    remindersData: any[]
    auditReportsData: any[]
    clients: any[]
    accessLevel: AccessLevel
    activitiesColumns: any[]
}

export default function ServicesClientWrapper({
    servicesData,
    activitiesData,
    remindersData,
    auditReportsData,
    clients,
    accessLevel,
    activitiesColumns
}: Props) {
    const [activeTab, setActiveTab] = useState<'records' | 'activities' | 'audits'>('records')
    const [isAuditFormOpen, setIsAuditFormOpen] = useState(false)
    const [isBulkAuditImportOpen, setIsBulkAuditImportOpen] = useState(false)

    const serviceStats = [
        { label: 'TOTAL SERVICES', value: servicesData.length, bg: 'bg-slate-50', dot: 'bg-slate-400', color: 'text-slate-600' },
        { label: 'SCHEDULED', value: servicesData.filter((s: any) => s.status?.toLowerCase() === 'scheduled').length, bg: 'bg-blue-50/50', dot: 'bg-blue-500', color: 'text-blue-600' },
        { label: 'COMPLETED', value: servicesData.filter((s: any) => s.status?.toLowerCase() === 'completed').length, bg: 'bg-emerald-50/50', dot: 'bg-emerald-500', color: 'text-emerald-600' },
    ]

    const activityStats = [
        { label: 'TOTAL ACTIVITIES', value: activitiesData.length + remindersData.length, bg: 'bg-slate-50', dot: 'bg-slate-400', color: 'text-slate-600' },
        { label: 'PENDING REMINDERS', value: remindersData.length, bg: 'bg-amber-50/50', dot: 'bg-amber-500', color: 'text-amber-600' },
    ]

    const auditStats = [
        { label: 'TOTAL AUDITS', value: auditReportsData.length, bg: 'bg-slate-50', dot: 'bg-slate-400', color: 'text-slate-600' },
        { label: 'COMPLETED', value: auditReportsData.filter((a: any) => a.status?.toLowerCase() === 'completed').length, bg: 'bg-emerald-50/50', dot: 'bg-emerald-500', color: 'text-emerald-600' },
        { label: 'NEEDS REVIEW', value: auditReportsData.filter((a: any) => a.status?.toLowerCase() === 'needs review').length, bg: 'bg-amber-50/50', dot: 'bg-amber-500', color: 'text-amber-600' },
    ]

    const statsToDisplay = activeTab === 'records' ? serviceStats :
        activeTab === 'activities' ? activityStats : auditStats

    return (
        <div className="w-[calc(100vw-300px)] h-screen overflow-y-auto bg-slate-50 relative p-8">
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left Column: Main Content */}
                <div className="flex-1 min-w-0 space-y-0">
                    {/* Page Header */}
                    <div className="mb-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block flex items-center gap-2">
                            <Wrench className="w-3 h-3" /> Dashboard / Services
                        </span>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none">Service Management</h1>
                    </div>

                    {/* Tabs */}
                    <div className="bg-slate-100 rounded-xl p-1.5 inline-flex mb-6 mt-2 border border-slate-200">
                        <button
                            onClick={() => setActiveTab('records')}
                            className={`px-6 py-2.5 text-sm font-bold tracking-wide transition-all rounded-lg flex items-center gap-2 ${activeTab === 'records' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        >
                            Service Records
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'records' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'}`}>
                                {servicesData.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('activities')}
                            className={`px-6 py-2.5 text-sm font-bold tracking-wide transition-all rounded-lg flex items-center gap-2 ${activeTab === 'activities' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        >
                            Client Activities & Reminders
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'activities' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'}`}>
                                {activitiesData.length + remindersData.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('audits')}
                            className={`px-6 py-2.5 text-sm font-bold tracking-wide transition-all rounded-lg flex items-center gap-2 ${activeTab === 'audits' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        >
                            Digital Audit Reports
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'audits' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'}`}>
                                {auditReportsData.length}
                            </span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className={`transition-all duration-300 ${activeTab === 'records' ? 'block' : 'hidden'}`}>
                        {/* Wrap in negative margin since ServiceRecordsTable has its own padding/bg */}
                        <div className="-mt-4">
                            <ServiceRecordsTable initialData={servicesData} accessLevel={accessLevel} />
                        </div>
                    </div>

                    <div className={`transition-all duration-300 ${activeTab === 'activities' ? 'block' : 'hidden'}`}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <ActivitiesClientView
                                title="Client Activities"
                                columns={activitiesColumns}
                                data={activitiesData}
                                upcomingReminders={remindersData}
                                clients={clients}
                                accessLevel={accessLevel}
                            />
                        </div>
                    </div>

                    <div className={`transition-all duration-300 ${activeTab === 'audits' ? 'block' : 'hidden'}`}>
                        <div className="-mt-4">
                            <AuditReportsTable
                                initialData={auditReportsData}
                                accessLevel={accessLevel}
                                onAdd={() => setIsAuditFormOpen(true)}
                                onBulkImport={() => setIsBulkAuditImportOpen(true)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Statistics */}
                <div className="w-full xl:w-[340px] flex-shrink-0 space-y-4 pt-0 flex flex-col mt-0">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Activity</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-slate-900">
                                {activeTab === 'records' ? 'Service Status' :
                                    activeTab === 'activities' ? 'Activity Status' : 'Audit Status'}
                            </h3>
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Count</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {statsToDisplay.map((stat: any, i: number) => (
                                <div key={i} className={`${stat.bg} w-full rounded-2xl p-4 flex flex-col gap-3 border border-white shadow-sm hover:shadow-md transition-shadow`}>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                                        <span className={`text-[10px] font-bold tracking-wider uppercase ${stat.color} leading-none`}>{stat.label}</span>
                                    </div>
                                    <span className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/60 flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 text-slate-800">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            <span className="font-bold text-sm">Recent Activity</span>
                        </div>
                        <button className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors">
                            Show
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isAuditFormOpen && (
                <AuditReportForm
                    clients={clients}
                    onClose={() => setIsAuditFormOpen(false)}
                    onSuccess={() => {
                        setIsAuditFormOpen(false)
                        window.location.reload()
                    }}
                />
            )}

            <BulkImportAuditReportsModal
                isOpen={isBulkAuditImportOpen}
                onClose={() => setIsBulkAuditImportOpen(false)}
                clients={clients}
                onSuccess={(count) => {
                    console.log(`Successfully imported ${count} audit reports`)
                    window.location.reload()
                }}
            />
        </div>
    )
}
