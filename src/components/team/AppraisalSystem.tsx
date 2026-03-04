'use client'

import { useState } from 'react'
import { Percent, TrendingUp, Award, Calendar, AlertCircle } from 'lucide-react'

interface AppraisalData {
    month: string
    tasksCompleted: number
    tasksAssigned: number
    attendance: number // 0-100
    leavesTaken: number
}

export default function AppraisalSystem() {
    const [history] = useState<AppraisalData[]>([
        { month: 'February 2026', tasksCompleted: 120, tasksAssigned: 130, attendance: 95, leavesTaken: 1 },
        { month: 'January 2026', tasksCompleted: 110, tasksAssigned: 110, attendance: 100, leavesTaken: 0 },
    ])

    const calculateScore = (data: AppraisalData) => {
        const taskScore = (data.tasksCompleted / data.tasksAssigned) * 60 // 60% weight
        const attendanceScore = (data.attendance / 100) * 40 // 40% weight
        return Math.round(taskScore + attendanceScore)
    }

    const currentScore = calculateScore(history[0])

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Percent className="w-5 h-5 text-indigo-500" />
                Performance Appraisal
            </h3>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-lg shadow-indigo-100 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-1">Estimated Appraisal</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black">{currentScore}%</span>
                        <TrendingUp className="w-6 h-6 text-emerald-300" />
                    </div>
                    <p className="text-sm mt-4 text-indigo-50 font-medium max-w-[200px]">
                        Based on your performance in {history[0].month}.
                    </p>
                </div>
                {/* Abstract background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 px-1">Appraisal Factors</h4>

                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Completion</p>
                                <p className="text-sm font-black text-slate-700">{history[0].tasksCompleted} / {history[0].tasksAssigned}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black text-indigo-600">Weighted 60%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
                                <p className="text-sm font-black text-slate-700">{history[0].attendance}%</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black text-emerald-600">Weighted 40%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        Your appraisal is calculated based on tasks completed vs. targeted tasks, adjusted for any leaves or absences during the month.
                    </p>
                </div>
            </div>
        </div>
    )
}
