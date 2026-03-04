'use client'

import { useState, useEffect } from 'react'
import { Users, Clock, FileText, Calendar, TrendingUp, Percent, ShieldCheck } from 'lucide-react'
import TimeSheet from '@/components/team/TimeSheet'
import DailyProgressReport from '@/components/team/DailyProgressReport'
import EmployeeSchedule from '@/components/team/EmployeeSchedule'
import EmployeePerformance from '@/components/team/EmployeePerformance'
import AppraisalSystem from '@/components/team/AppraisalSystem'
import EmployeeMaster from '@/components/team/EmployeeMaster'

export default function TeamDashboardPage() {
    const [activeTab, setActiveTab] = useState<'timesheet' | 'dpr' | 'appraisal' | 'admin'>('timesheet')
    const [userRole, setUserRole] = useState<'admin' | 'employee'>('employee') // Initializing as employee for safety

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-2">
                        <Users className="w-3 h-3" /> Dashboard / Team
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 leading-none">Employee Productivity</h1>
                    <p className="text-sm text-slate-500 mt-2">Manage your time, track daily progress, and monitor performance.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setUserRole('employee')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${userRole === 'employee' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Employee View
                    </button>
                    <button
                        onClick={() => setUserRole('admin')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${userRole === 'admin' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Admin View
                    </button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Left Side: Navigation / Main Feature taking up majority */}
                <div className="xl:col-span-8 flex flex-col space-y-6">
                    {/* Feature Navigation Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex overflow-x-auto hide-scrollbar gap-2">
                        <button
                            onClick={() => setActiveTab('timesheet')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'timesheet'
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                                }`}
                        >
                            <Clock className="w-4 h-4" /> Time Sheet
                        </button>

                        <button
                            onClick={() => setActiveTab('dpr')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'dpr'
                                ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                                }`}
                        >
                            <FileText className="w-4 h-4" /> Daily Progress
                        </button>

                        {userRole === 'admin' && (
                            <button
                                onClick={() => setActiveTab('appraisal')}
                                className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'appraisal'
                                    ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                                    }`}
                            >
                                <Percent className="w-4 h-4" /> Appraisal
                            </button>
                        )}

                        {userRole === 'admin' && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'admin'
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                                    }`}
                            >
                                <ShieldCheck className="w-4 h-4" /> Master (Admin)
                            </button>
                        )}
                    </div>

                    {/* Active Main Component Area */}
                    <div className="flex-1">
                        {activeTab === 'timesheet' && <TimeSheet />}
                        {activeTab === 'dpr' && <DailyProgressReport />}
                        {activeTab === 'appraisal' && <AppraisalSystem />}
                        {activeTab === 'admin' && userRole === 'admin' && <EmployeeMaster />}

                        <div className="block xl:hidden space-y-6 mt-6">
                            <EmployeePerformance />
                            <EmployeeSchedule />
                        </div>
                    </div>
                </div>

                {/* Right Side: Continuous Dashboard Elements (Schedule & Performance) */}
                <div className="hidden xl:flex xl:col-span-4 flex-col space-y-6 overflow-hidden">
                    {/* Always show Performance on Desktop */}
                    <div className="min-h-[400px]">
                        <EmployeePerformance />
                    </div>

                    {/* Always show Schedule on Desktop */}
                    <div className="flex-1 min-h-[450px]">
                        <EmployeeSchedule />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
