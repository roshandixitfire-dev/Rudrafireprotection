'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Search, Calendar, CheckSquare, Clock } from 'lucide-react'

interface DPRRecord {
    id: number
    date: string
    tasks: { id: number, description: string, status: 'Completed' | 'Pending', type: string }[]
    outcomes: string
    challenges: string
}

export default function DailyProgressReport() {
    const [reports, setReports] = useState<DPRRecord[]>([
        {
            id: 1,
            date: new Date().toISOString().split('T')[0],
            tasks: [
                { id: 101, description: 'Meeting with Client A regarding new project scope', status: 'Completed', type: 'Meeting' },
                { id: 102, description: 'Site Visit at Location B for Phase 2 inspection', status: 'Completed', type: 'Site Visit' },
            ],
            outcomes: 'Successfully finalized scope. Site inspection passed.',
            challenges: 'Traffic delayed site visit by 30 mins.'
        },
        {
            id: 2,
            date: '2026-02-28',
            tasks: [
                { id: 103, description: 'Drafting contract for Service X', status: 'Completed', type: 'Office Work' },
                { id: 104, description: 'Follow-up calls with 5 warm leads', status: 'Pending', type: 'Office Work' },
            ],
            outcomes: 'Contract sent for review.',
            challenges: 'Could not reach 2 out of 5 leads.'
        }
    ])

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [newReport, setNewReport] = useState<{ outcomes: string, challenges: string, tasks: { id: number, description: string, status: 'Completed' | 'Pending', type: string }[] }>({
        outcomes: '',
        challenges: '',
        tasks: [
            // Simulating pre-filled tasks from today's schedule
            { id: 201, description: 'Team Sync up', status: 'Pending', type: 'Meeting' },
            { id: 202, description: 'Client Pitch prep', status: 'Pending', type: 'Office Work' }
        ]
    })

    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const report = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            ...newReport
        }
        setReports([report, ...reports])
        setIsFormOpen(false)
        // Reset form...
    }

    const toggleTaskStatus = (taskId: number) => {
        setNewReport(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t)
        }))
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Daily Progress Reports
                </h3>

                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> New DPR
                </button>
            </div>

            {/* List View */}
            {!isFormOpen && (
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {reports.map(report => (
                        <div key={report.id} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-emerald-100 transition-colors group">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                                <div className="flex items-center gap-2 text-slate-800 font-bold">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {mounted ? new Date(report.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : report.date}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${report.tasks.every(t => t.status === 'Completed')
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {report.tasks.filter(t => t.status === 'Completed').length}/{report.tasks.length} Tasks
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tasks Executed</h5>
                                    <ul className="space-y-2">
                                        {report.tasks.map(task => (
                                            <li key={task.id} className="flex items-start gap-2 text-sm text-slate-700">
                                                <div className="mt-0.5 mt-1">
                                                    {task.status === 'Completed' ? (
                                                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                    )}
                                                </div>
                                                <span className={`${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                                                    [{task.type}] {task.description}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-50">
                                    <div>
                                        <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Outcomes</h5>
                                        <p className="text-sm text-slate-700 italic">{report.outcomes || 'No specific outcomes noted.'}</p>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Challenges</h5>
                                        <p className="text-sm text-slate-700 italic">{report.challenges || 'No challenges reported.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form View */}
            {isFormOpen && (
                <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl p-6 border border-slate-100 overflow-y-auto">
                    <h4 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                        File Report for Today
                    </h4>

                    <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                                Scheduled Tasks
                                <span className="text-xs font-normal text-slate-500">Check to mark completed</span>
                            </h5>
                            <div className="space-y-2">
                                {newReport.tasks.map(task => (
                                    <label key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={task.status === 'Completed'}
                                            onChange={() => toggleTaskStatus(task.id)}
                                            className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-100 border-slate-300"
                                        />
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                {task.description}
                                            </p>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{task.type}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Key Outcomes / Achievements</label>
                                <textarea
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px]"
                                    placeholder="What were the results of today's work?"
                                    value={newReport.outcomes}
                                    onChange={(e) => setNewReport({ ...newReport, outcomes: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Challenges / Blockers</label>
                                <textarea
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px]"
                                    placeholder="Any issues encountered?"
                                    value={newReport.challenges}
                                    onChange={(e) => setNewReport({ ...newReport, challenges: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-auto pt-4 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-5 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200 transition-all"
                            >
                                Submit Report
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
